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
import { BackupService } from './services/BackupService.js';
import { DiscordWebhookService } from './services/DiscordWebhookService.js';
import { DependencyService } from './services/DependencyService.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const BASE_DATA_DIR = path.resolve(process.cwd(), 'server_data');
const PLUGINS_DIR = path.join(BASE_DATA_DIR, 'plugins');
const PACKS_DIR = path.join(BASE_DATA_DIR, 'resourcepacks');
const BACKUPS_DIR = path.join(BASE_DATA_DIR, 'backups');
const SERVER_PROPERTIES_PATH = path.join(BASE_DATA_DIR, 'server.properties');

// Ensure base directories
[BASE_DATA_DIR, PLUGINS_DIR, PACKS_DIR, BACKUPS_DIR].forEach(dir => {
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
const backupService = new BackupService(BASE_DATA_DIR);
const discordService = new DiscordWebhookService(BASE_DATA_DIR);
const dependencyService = new DependencyService();

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
app.get('/api/marketplace/github-user/:username', async (req, res) => {
  const repos = await marketplaceService.getUserRepositories(req.params.username);
  res.json({ repos });
});

app.get('/api/marketplace/github-releases/:owner/:repo', async (req, res) => {
  const releases = await marketplaceService.getGitHubReleases(req.params.repo, req.params.owner);
  res.json({ releases });
});

app.get('/api/marketplace/github-releases/:repo', async (req, res) => {
  const releases = await marketplaceService.getGitHubReleases(req.params.repo, 'efekkoc');
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

// 8. Backup & Snapshot Vault
app.get('/api/backups', (req, res) => {
  res.json({ backups: backupService.listBackups() });
});

app.post('/api/backups/create', async (req, res) => {
  const { type } = req.body;
  try {
    const backup = await backupService.createBackup(type || 'FULL');
    res.json({ success: true, backup });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backups/:fileName/restore', (req, res) => {
  const result = backupService.restoreBackup(req.params.fileName);
  res.json(result);
});

app.delete('/api/backups/:fileName', (req, res) => {
  const success = backupService.deleteBackup(req.params.fileName);
  res.json({ success });
});

app.get('/api/backups/download/:fileName', (req, res) => {
  const filePath = backupService.getBackupPath(req.params.fileName);
  if (!filePath) return res.status(404).send('Backup not found');
  res.download(filePath);
});

// 9. Discord Alert Webhooks
app.get('/api/discord/config', (req, res) => {
  res.json(discordService.getConfig());
});

app.post('/api/discord/config', (req, res) => {
  const updated = discordService.updateConfig(req.body);
  res.json({ success: true, config: updated });
});

app.post('/api/discord/test', async (req, res) => {
  const result = await discordService.sendTestWebhook();
  res.json(result);
});

// 10. Plugin Dependency Conflict Matrix
app.get('/api/plugins/dependencies', (req, res) => {
  const plugins = pluginManager.getPlugins();
  const analysis = dependencyService.analyze(plugins);
  res.json(analysis);
});

// 11. Visual server.properties Tweak Studio
function getPropertiesObj(): Record<string, any> {
  if (!fs.existsSync(SERVER_PROPERTIES_PATH)) {
    const defaultProps = `motd=\\u00A7b\\u00A7lAQUAFORGE \\u00A77Studio \\u00A7f- Powered by efekkoc
server-port=25565
max-players=50
gamemode=survival
difficulty=normal
pvp=true
allow-flight=false
enable-command-block=true
spawn-monsters=true
spawn-animals=true
view-distance=10
simulation-distance=8
online-mode=true
white-list=false
level-name=world
`;
    fs.writeFileSync(SERVER_PROPERTIES_PATH, defaultProps, 'utf-8');
  }

  const content = fs.readFileSync(SERVER_PROPERTIES_PATH, 'utf-8');
  const props: Record<string, any> = {};
  for (const line of content.split(/\r?\n/)) {
    if (line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const k = line.substring(0, idx).trim();
    let v: any = line.substring(idx + 1).trim();
    if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else if (!isNaN(Number(v)) && v !== '') v = Number(v);
    props[k] = v;
  }
  return props;
}

app.get('/api/properties', (req, res) => {
  res.json({ properties: getPropertiesObj() });
});

app.post('/api/properties', (req, res) => {
  const { updates } = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid updates payload' });
  }

  const current = getPropertiesObj();
  const merged = { ...current, ...updates };

  let out = '# Minecraft server properties - Managed by AquaForge Studio\n';
  out += `# Auto-synced at ${new Date().toISOString()}\n`;
  for (const [k, v] of Object.entries(merged)) {
    out += `${k}=${v}\n`;
  }

  fs.copyFileSync(SERVER_PROPERTIES_PATH, `${SERVER_PROPERTIES_PATH}.backup`);
  fs.writeFileSync(SERVER_PROPERTIES_PATH, out, 'utf-8');

  res.json({ success: true, properties: merged });
});

// 12. AquaMap Live Radar & World Coordinates
const radarPlayers: any[] = [];

app.get('/api/radar/players', (req, res) => {
  res.json({
    world: 'world',
    spawn: { x: 0, y: 64, z: 0 },
    time: '12:00 (Day)',
    weather: 'CLEAR',
    engine: 'AquaMap Dynamic Radar Engine v2.0',
    players: serverManager.getStatus() === 'ONLINE' ? radarPlayers : []
  });
});

app.post('/api/suite/deploy', (req, res) => {
  const { pluginIds } = req.body;
  if (!Array.isArray(pluginIds)) {
    return res.status(400).json({ success: false, error: 'pluginIds must be an array' });
  }
  const deployed = pluginManager.deployAquaPlugins(pluginIds);
  res.json({ success: true, deployed, total: deployed.length });
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
