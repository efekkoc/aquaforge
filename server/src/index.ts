import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import { DiagnosticEngine } from './services/DiagnosticEngine.js';
import { ServerProcessManager } from './services/ServerProcessManager.js';
import { PluginManager } from './services/PluginManager.js';
import { MarketplaceService } from './services/MarketplaceService.js';
import { DevSyncService } from './services/DevSyncService.js';
import { ConfigInspector } from './services/ConfigInspector.js';
import { ResourcePackService } from './services/ResourcePackService.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const BASE_DATA_DIR = path.resolve(process.cwd(), 'server_data');
const PLUGINS_DIR = path.join(BASE_DATA_DIR, 'plugins');
const PACKS_DIR = path.join(BASE_DATA_DIR, 'resourcepacks');
const SERVER_PROPERTIES_PATH = path.join(BASE_DATA_DIR, 'server.properties');

// Ensure base directories
[BASE_DATA_DIR, PLUGINS_DIR, PACKS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Initialize Services
const diagnosticEngine = new DiagnosticEngine();
const serverManager = new ServerProcessManager(BASE_DATA_DIR, diagnosticEngine);
const pluginManager = new PluginManager(PLUGINS_DIR);
const marketplaceService = new MarketplaceService(PLUGINS_DIR);
const devSyncService = new DevSyncService(PLUGINS_DIR);
const configInspector = new ConfigInspector(BASE_DATA_DIR);
const resourcePackService = new ResourcePackService(PACKS_DIR, SERVER_PROPERTIES_PATH);

// File Upload config
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.originalname.endsWith('.zip')) {
      cb(null, PACKS_DIR);
    } else {
      cb(null, PLUGINS_DIR);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: uploadStorage });

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast utility to connected WebSocket clients
function broadcast(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Connect Server Manager events to WebSocket
serverManager.setCallbacks({
  onLog: (line) => broadcast('console_log', { line, timestamp: new Date().toISOString() }),
  onMetrics: (metrics) => broadcast('metrics_update', metrics),
  onStatusChange: (status) => broadcast('status_change', { status })
});

// Connect DevSync events
devSyncService.setOnSyncCallback((watcher, fileName) => {
  broadcast('devsync_trigger', {
    watcherName: watcher.name,
    fileName,
    message: `Hot-swapped ${fileName} into plugins/`
  });
});

// ---------------- REST API ROUTES ----------------

// 1. Server Controller
app.get('/api/server/status', (req, res) => {
  res.json({
    status: serverManager.getStatus(),
    metrics: serverManager.getMetrics(),
    config: serverManager.getConfig()
  });
});

app.post('/api/server/start', (req, res) => {
  const result = serverManager.startServer();
  res.json(result);
});

app.post('/api/server/stop', (req, res) => {
  const result = serverManager.stopServer();
  res.json(result);
});

app.post('/api/server/restart', (req, res) => {
  const result = serverManager.restartServer();
  res.json(result);
});

app.post('/api/server/kill', (req, res) => {
  const result = serverManager.killServer();
  res.json(result);
});

app.post('/api/server/command', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Command is required' });
  const result = serverManager.sendCommand(command);
  res.json(result);
});

app.get('/api/server/logs', (req, res) => {
  res.json({ logs: serverManager.getLogHistory() });
});

app.post('/api/server/trigger-error', (req, res) => {
  serverManager.triggerSampleError();
  res.json({ success: true, message: 'Sample exception triggered and fed into Diagnostic Engine' });
});

// 2. Diagnostics & Bug Hunter
app.get('/api/diagnostics', (req, res) => {
  res.json({ reports: diagnosticEngine.getReports() });
});

app.post('/api/diagnostics/:id/resolve', (req, res) => {
  const success = diagnosticEngine.resolveReport(req.params.id);
  res.json({ success });
});

app.post('/api/diagnostics/clear', (req, res) => {
  diagnosticEngine.clearReports();
  res.json({ success: true });
});

// 3. Plugin Management
app.get('/api/plugins', (req, res) => {
  const plugins = pluginManager.getPlugins();
  res.json({ plugins });
});

app.post('/api/plugins/:fileName/toggle', (req, res) => {
  const result = pluginManager.togglePlugin(req.params.fileName);
  res.json(result);
});

app.delete('/api/plugins/:fileName', (req, res) => {
  const result = pluginManager.deletePlugin(req.params.fileName);
  res.json(result);
});

app.post('/api/plugins/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, fileName: req.file.filename });
});

// 4. Marketplace & GitHub Integration
app.get('/api/marketplace/github-releases/:repo', async (req, res) => {
  const releases = await marketplaceService.getGitHubReleases(req.params.repo);
  res.json({ releases });
});

app.get('/api/marketplace/modrinth', async (req, res) => {
  const query = (req.query.q as string) || '';
  const hits = await marketplaceService.searchModrinth(query);
  res.json({ plugins: hits });
});

app.post('/api/marketplace/install', async (req, res) => {
  const { fileName, downloadUrl } = req.body;
  if (!fileName) return res.status(400).json({ error: 'fileName is required' });
  const result = await marketplaceService.installPlugin(fileName, downloadUrl);
  res.json(result);
});

// 5. Dev-Sync Watchers
app.get('/api/devsync', (req, res) => {
  res.json({ watchers: devSyncService.getWatchers() });
});

app.post('/api/devsync', (req, res) => {
  const config = req.body;
  const result = devSyncService.addWatcher(config);
  res.json(result);
});

app.post('/api/devsync/:id/toggle', (req, res) => {
  const success = devSyncService.toggleWatcher(req.params.id);
  res.json({ success });
});

app.delete('/api/devsync/:id', (req, res) => {
  const success = devSyncService.removeWatcher(req.params.id);
  res.json({ success });
});

// 6. Config Inspector
app.get('/api/configs', (req, res) => {
  const configs = configInspector.getAvailableConfigs();
  res.json({ configs });
});

app.get('/api/configs/read', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: 'path query required' });
  try {
    const data = configInspector.readConfig(filePath);
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/configs/validate', (req, res) => {
  const { content } = req.body;
  const result = configInspector.validateYaml(content || '');
  res.json(result);
});

app.post('/api/configs/fix-indentation', (req, res) => {
  const { content } = req.body;
  const fixed = configInspector.fixYamlIndentation(content || '');
  res.json({ content: fixed });
});

app.post('/api/configs/save', (req, res) => {
  const { path: relPath, content } = req.body;
  if (!relPath || content === undefined) return res.status(400).json({ error: 'path and content required' });
  const result = configInspector.saveConfig(relPath, content);
  res.json(result);
});

// 7. Resource Pack Hub
app.get('/api/resourcepacks', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  const packs = resourcePackService.getResourcePacks(baseUrl);
  const current = resourcePackService.getCurrentAppliedPack();
  res.json({ packs, current });
});

app.post('/api/resourcepacks/upload', upload.single('pack'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, fileName: req.file.filename });
});

app.post('/api/resourcepacks/apply', (req, res) => {
  const { fileName } = req.body;
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  const result = resourcePackService.applyToProperties(fileName, baseUrl);
  res.json(result);
});

app.get('/api/resourcepacks/download/:fileName', (req, res) => {
  const fullPath = resourcePackService.getPackFilePath(req.params.fileName);
  if (!fullPath) return res.status(404).send('Resource pack not found');
  res.download(fullPath);
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      status: serverManager.getStatus(),
      metrics: serverManager.getMetrics(),
      logs: serverManager.getLogHistory()
    }
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'command') {
        serverManager.sendCommand(parsed.data);
      }
    } catch (e) {}
  });
});

server.listen(PORT, () => {
  console.log(`\x1b[36m[AquaForge Backend]\x1b[0m Orchestrator server running on http://localhost:${PORT}`);
  console.log(`\x1b[35m[AquaForge WebSocket]\x1b[0m Real-time hub live on ws://localhost:${PORT}`);
});
