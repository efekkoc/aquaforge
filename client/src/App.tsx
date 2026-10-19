import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, Shield, Terminal, Bug, Box, RefreshCw, FileCode, PackageOpen, 
  Play, Square, RotateCw, Skull, Activity, Zap, HardDrive, Users, 
  Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight,
  Sliders, UserCheck, AlertOctagon, Download, Code2, Copy, Check, Power, Trash2, Wand2,
  Image as ImageIcon, Video, Github, Search, Plus, FolderSearch, ArrowRight, Save
} from 'lucide-react';
import { ansiToHtml } from './utils/ansi';
import { ServerStatus, ServerMetrics, DiagnosticReport, PluginMeta, DevSyncWatcher, ResourcePackItem, MarketplacePlugin } from './types';

export const App: React.FC = () => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'diagnostics' | 'plugins' | 'devsync' | 'config' | 'resourcepack'>('overview');
  const [userRole, setUserRole] = useState<'admin' | 'developer'>('admin'); // Admin vs Developer view toggle!
  
  // Server State
  const [status, setStatus] = useState<ServerStatus>('ONLINE');
  const [metrics, setMetrics] = useState<ServerMetrics>({
    tps: 20.0,
    mspt: 11.4,
    memoryUsedMB: 1240,
    memoryMaxMB: 4096,
    cpuPercent: 4.2,
    onlinePlayers: 4,
    maxPlayers: 50,
    uptimeSeconds: 1420
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [plugins, setPlugins] = useState<PluginMeta[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' | 'error' } | null>(null);

  // Background Media Customizer
  const [bgMediaUrl, setBgMediaUrl] = useState<string>('/background.jpg');
  const [bgType, setBgType] = useState<'none' | 'image' | 'video'>('image');
  const [bgOpacity, setBgOpacity] = useState<number>(30);

  // Diagnostics state
  const [expandedReportId, setExpandedReportId] = useState<string | null>('demo-diagnostic-1');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Config Studio state
  const [selectedConfigPath, setSelectedConfigPath] = useState('plugins/AquaFishing/config.yml');
  const [configContent, setConfigContent] = useState('');
  const [configValidation, setConfigValidation] = useState<{ valid: boolean; error?: string; line?: number; warnings: string[] }>({ valid: true, warnings: [] });

  // DevSync state
  const [watchers, setWatchers] = useState<DevSyncWatcher[]>([]);
  const [newWatcherDir, setNewWatcherDir] = useState('/Users/efekoc/AquaFishing/build/libs');

  // Resource Pack state
  const [packs, setPacks] = useState<ResourcePackItem[]>([]);

  // Refs
  const logContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Fetch & WebSocket
  const refreshAll = () => {
    fetch('/api/server/status').then(r => r.json()).then(d => {
      if (d.status) setStatus(d.status);
      if (d.metrics) setMetrics(d.metrics);
    }).catch(() => {});

    fetch('/api/server/logs').then(r => r.json()).then(d => setLogs(d.logs || [])).catch(() => {});
    fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || [])).catch(() => {});
    fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])).catch(() => {});
    fetch('/api/devsync').then(r => r.json()).then(d => setWatchers(d.watchers || [])).catch(() => {});
    fetch('/api/resourcepacks').then(r => r.json()).then(d => setPacks(d.packs || [])).catch(() => {});
    
    // Load default config
    fetch(`/api/configs/read?path=${encodeURIComponent(selectedConfigPath)}`)
      .then(r => r.json())
      .then(d => setConfigContent(d.content || ''))
      .catch(() => {});
  };

  useEffect(() => {
    refreshAll();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === 'init') {
          setStatus(data.status);
          setMetrics(data.metrics);
          setLogs(data.logs || []);
        } else if (type === 'console_log') {
          setLogs(prev => [...prev, data.line]);
          if (data.line.includes('Exception') || data.line.includes('Error')) {
            fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || []));
          }
        } else if (type === 'metrics_update') {
          setMetrics(data);
        } else if (type === 'status_change') {
          setStatus(data.status);
        } else if (type === 'devsync_trigger') {
          showToast(`⚡ Dev-Sync: ${data.fileName} hot-swapped into plugins!`, 'success');
          fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || []));
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Server Actions
  const handleServerAction = (action: 'start' | 'stop' | 'restart' | 'kill') => {
    fetch(`/api/server/${action}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        showToast(d.message, action === 'kill' ? 'error' : 'success');
        refreshAll();
      });
  };

  const handleSendCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', data: cmd }));
    } else {
      fetch('/api/server/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
    }
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setCommandInput('');
  };

  const handleTriggerError = () => {
    fetch('/api/server/trigger-error', { method: 'POST' })
      .then(() => {
        showToast('⚠ Test Exception injected! Check the Bug Hunter tab.', 'warn');
        setTimeout(() => {
          fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || []));
        }, 400);
      });
  };

  const handleTogglePlugin = (fileName: string) => {
    fetch(`/api/plugins/${fileName}/toggle`, { method: 'POST' })
      .then(() => fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])));
  };

  const handleSaveConfig = () => {
    fetch('/api/configs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedConfigPath, content: configContent })
    })
      .then(r => r.json())
      .then(d => showToast(d.message, 'success'));
  };

  const handleFixIndentation = () => {
    fetch('/api/configs/fix-indentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: configContent })
    })
      .then(r => r.json())
      .then(d => {
        setConfigContent(d.content);
        showToast('Auto-converted all tabs to 2 spaces!', 'success');
      });
  };

  const unresolvedCount = reports.filter(r => !r.resolved).length;

  return (
    <div className="relative min-h-screen bg-[#070a10] text-[#e2e8f0] font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Dynamic Background (Custom Video / Image / Subtle Deepslate Grid) */}
      {bgType === 'video' && bgMediaUrl ? (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ opacity: bgOpacity / 100 }}
          src={bgMediaUrl}
        />
      ) : bgType === 'image' && bgMediaUrl ? (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
          style={{ backgroundImage: `url(${bgMediaUrl})`, opacity: bgOpacity / 100 }}
        />
      ) : (
        /* Atmospheric Minecraft Deepslate & Prismarine ambient mesh */
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/15 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>
      )}

      {/* Main Glass Layout Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ${
            toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50' :
            toast.type === 'warn' ? 'bg-amber-950/90 text-amber-200 border-amber-500/50' :
            'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{toast.msg}</span>
          </div>
        )}

        {/* ================= TOP NAVIGATION HUD ================= */}
        <header className="h-16 px-6 bg-[#0a0f18]/85 backdrop-blur-xl border-b border-[#182336] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="AquaForge" 
                className="w-10 h-10 rounded-xl object-cover shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/40" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-white bg-clip-text text-transparent">
                    AQUAFORGE
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                    PAPER 1.21.4
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">Server Orchestrator & Bug Diagnostic Studio</p>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

            {/* Server Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e1626] border border-slate-800 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${
                status === 'ONLINE' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                status === 'STARTING' ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
              }`} />
              <span className="text-slate-300 font-bold">{status}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Port 25565</span>
            </div>
          </div>

          {/* Center: Live Telemetry Gauges */}
          {status === 'ONLINE' && (
            <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 bg-[#0b1220]/90 rounded-xl border border-[#1b273d] text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">TPS:</span>
                <span className="font-bold text-cyan-300">{metrics.tps.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">MSPT:</span>
                <span className="font-bold text-emerald-400">{metrics.mspt.toFixed(1)}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400">RAM:</span>
                <span className="font-bold text-purple-300">{(metrics.memoryUsedMB / 1024).toFixed(1)} / {(metrics.memoryMaxMB / 1024).toFixed(0)} GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Players:</span>
                <span className="font-bold text-amber-300">{metrics.onlinePlayers} / {metrics.maxPlayers}</span>
              </div>
            </div>
          )}

          {/* Right Controls: Role Switcher & Power Buttons */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher: Admin Mode vs Developer Mode */}
            <div className="flex p-0.5 bg-[#0e1626] rounded-xl border border-[#1e2a40] text-xs font-semibold">
              <button
                onClick={() => setUserRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  userRole === 'admin' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                onClick={() => setUserRole('developer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  userRole === 'developer' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Developer
              </button>
            </div>

            {/* Power Controls */}
            {status === 'OFFLINE' ? (
              <button
                onClick={() => handleServerAction('start')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Server
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleServerAction('restart')}
                  className="p-2 bg-[#0e1726] hover:bg-[#15233a] border border-[#1e2d48] text-cyan-400 rounded-xl transition-all cursor-pointer"
                  title="Graceful Restart"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleServerAction('stop')}
                  className="p-2 bg-[#0e1726] hover:bg-[#15233a] border border-amber-500/30 text-amber-400 rounded-xl transition-all cursor-pointer"
                  title="Safe Stop (graceful save)"
                >
                  <Square className="w-4 h-4 fill-amber-400" />
                </button>
                <button
                  onClick={() => handleServerAction('kill')}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 rounded-xl transition-all cursor-pointer"
                  title="Force Kill (SIGKILL)"
                >
                  <Skull className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= APP BODY ================= */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Side Navigation Bar */}
          <aside className="w-60 bg-[#090d16]/90 backdrop-blur-xl border-r border-[#152033] flex flex-col justify-between p-3 select-none">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {userRole === 'admin' ? '🛡 Server Control Panel' : '⚡ Developer Suite'}
              </div>

              {[
                { id: 'overview', label: 'Server Overview', icon: Server, badge: null },
                { id: 'terminal', label: 'Live Console', icon: Terminal, badge: null },
                { 
                  id: 'diagnostics', 
                  label: 'Bug Hunter Studio', 
                  icon: Bug, 
                  badge: unresolvedCount > 0 ? `${unresolvedCount}` : null,
                  badgeColor: 'bg-red-500 text-white font-bold'
                },
                { id: 'plugins', label: 'Plugin Vault & Store', icon: Box, badge: `${plugins.length}` },
                { id: 'devsync', label: 'Dev-Sync & Hot-Swap', icon: RefreshCw, badge: 'AUTO' },
                { id: 'config', label: 'Config Studio', icon: FileCode, badge: null },
                { id: 'resourcepack', label: 'Resource Pack Hub', icon: PackageOpen, badge: null },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-950/80 to-[#0e213b] text-cyan-300 border border-cyan-700/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e1626] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${tab.badgeColor || 'bg-[#152136] text-slate-300'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom: Custom Background & Author Card */}
            <div className="space-y-2 pt-3 border-t border-[#152033]">
              {/* Background Media Dialog trigger */}
              <div className="p-2.5 bg-[#0d1424] rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Custom Media BG
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-500">{bgType}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      const url = prompt('Enter Image URL (e.g. your generated Minecraft artwork):', bgMediaUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80');
                      if (url) {
                        setBgMediaUrl(url);
                        setBgType('image');
                      }
                    }}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                  >
                    Set Image
                  </button>
                  <button 
                    onClick={() => {
                      const url = prompt('Enter Direct MP4 Video URL (for ambient background loop):', bgMediaUrl);
                      if (url) {
                        setBgMediaUrl(url);
                        setBgType('video');
                      }
                    }}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                  >
                    Set Video
                  </button>
                  {bgType !== 'none' && (
                    <button 
                      onClick={() => setBgType('none')}
                      className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 text-[10px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Developer Profile Badge */}
              <div className="px-3 py-2 bg-[#0d1424]/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">efekkoc</p>
                  <p className="text-[10px] text-cyan-400 font-mono">Paper Plugin Dev</p>
                </div>
                <a 
                  href="https://github.com/efekkoc" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 p-6 overflow-y-auto">

            {/* ================= TAB 1: OVERVIEW ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* ADMIN MODE BANNER (When Admin view is active) */}
                {userRole === 'admin' ? (
                  <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#0e2133] to-[#0a1524] rounded-2xl border border-emerald-600/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        Server Administrator Dashboard Mode
                      </div>
                      <h3 className="text-base font-bold text-white">One-Click Server Health & Safe Controls</h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Designed for network owners and admins: Monitor TPS, execute safe restarts, clear entity lag, and manage plugins without editing complex configuration files.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSendCommand('kill @e[type=item]')}
                        className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all"
                      >
                        🧹 Clear Ground Lag
                      </button>
                      <button
                        onClick={() => handleSendCommand('save-all')}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        💾 Save World
                      </button>
                      <button
                        onClick={() => handleSendCommand('reload confirm')}
                        className="px-3.5 py-2 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        ⚡ Reload Plugins
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-[#0e2133] to-[#0a1524] rounded-2xl border border-cyan-600/30 flex items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        <Code2 className="w-4 h-4" />
                        Plugin Developer & Bug Fixing Mode
                      </div>
                      <h3 className="text-base font-bold text-white">Paper 1.21.4 Diagnostics & Hot-Swap Active</h3>
                      <p className="text-xs text-slate-300">
                        Bytecode jar extraction, real-time log error triage, and automated Gradle build watcher enabled.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerError}
                      className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Bug className="w-4 h-4" />
                      Simulate Plugin Crash
                    </button>
                  </div>
                )}

                {/* Performance Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* TPS Gauge */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Server Tick Rate</span>
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${metrics.tps >= 19.5 ? 'text-cyan-300' : 'text-amber-400'}`}>
                        {metrics.tps.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ 20.0</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" 
                        style={{ width: `${(metrics.tps / 20) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tick Efficiency
                    </p>
                  </div>

                  {/* MSPT Budget */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Tick Time (MSPT)</span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold font-mono text-emerald-300">
                        {metrics.mspt.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ms (50ms max)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" 
                        style={{ width: `${(metrics.mspt / 50) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Headroom: <span className="text-emerald-400 font-bold font-mono">{(50 - metrics.mspt).toFixed(1)}ms</span> free for heavy plugins
                    </p>
                  </div>

                  {/* RAM Utilization */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Allocated JVM RAM</span>
                      <HardDrive className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold font-mono text-purple-300">
                        {(metrics.memoryUsedMB / 1024).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">GB / {(metrics.memoryMaxMB / 1024).toFixed(0)} GB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                        style={{ width: `${(metrics.memoryUsedMB / metrics.memoryMaxMB) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Garbage Collector: <span className="text-purple-300 font-semibold font-mono">Aikar G1GC</span>
                    </p>
                  </div>

                  {/* Online Players */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Online Players</span>
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold font-mono text-amber-300">
                        {metrics.onlinePlayers}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ {metrics.maxPlayers} slots</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400" 
                        style={{ width: `${(metrics.onlinePlayers / metrics.maxPlayers) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Network: <span className="text-emerald-400 font-bold font-mono">0% packet drop</span>
                    </p>
                  </div>
                </div>

                {/* Bug Alert Banner if Unresolved Exception Exists */}
                {unresolvedCount > 0 && (
                  <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                        <AlertOctagon className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-300">
                          {unresolvedCount} Active Exception Detected in Server Logs
                        </h4>
                        <p className="text-xs text-slate-300">
                          Culprit: <span className="font-bold text-white">{reports[0]?.culpritPlugin || 'Plugin'}</span> ({reports[0]?.location?.fileName}:{reports[0]?.location?.lineNumber}). Code fix is ready in Bug Hunter Studio.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('diagnostics')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      Inspect Bug Fix
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Server Details & Plugin Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Server Properties */}
                  <div className="lg:col-span-2 p-6 bg-[#0b101c]/90 rounded-2xl border border-[#182338] space-y-4">
                    <h4 className="text-sm font-bold text-slate-200">Server Architecture & Environment</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Server Software</span>
                        <span className="font-bold text-cyan-300 font-mono">Paper 1.21.4</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">JVM Engine</span>
                        <span className="font-bold text-emerald-400 font-mono">Java 21 (Temurin)</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Chunk Architecture</span>
                        <span className="font-bold text-slate-200 font-mono">Threaded Region</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Active Port</span>
                        <span className="font-bold text-slate-200 font-mono">25565 (IPv4)</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Installed Plugins</span>
                        <span className="font-bold text-cyan-400 font-mono">{plugins.length} Plugins</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Watch Daemon</span>
                        <span className="font-bold text-emerald-400 font-mono">Chokidar Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Plugins List */}
                  <div className="p-6 bg-[#0b101c]/90 rounded-2xl border border-[#182338] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200">Active Plugins</h4>
                      <button 
                        onClick={() => setActiveTab('plugins')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="space-y-2">
                      {plugins.slice(0, 4).map((p) => (
                        <div key={p.fileName} className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200">{p.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-2">v{p.version}</span>
                          </div>
                          <button
                            onClick={() => handleTogglePlugin(p.fileName)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              p.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {p.enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB 2: LIVE TERMINAL ================= */}
            {activeTab === 'terminal' && (
              <div className="h-[calc(100vh-8rem)] flex flex-col bg-[#070b13] rounded-2xl border border-[#19243a] overflow-hidden shadow-2xl">
                {/* Terminal Toolbar */}
                <div className="h-12 px-4 bg-[#0d1424] border-b border-[#182338] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200 font-mono">PaperMC Server Console</span>
                    <span className="text-[10px] font-mono text-slate-500">({logs.length} lines)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTriggerError}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      Trigger Test Error
                    </button>
                    <button
                      onClick={() => setLogs([])}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Output Stream */}
                <div
                  ref={logContainerRef}
                  className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 terminal-scroll select-text leading-relaxed bg-[#05080e]"
                >
                  {logs.map((line, idx) => (
                    <div 
                      key={idx} 
                      className="hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors"
                      dangerouslySetInnerHTML={{ __html: ansiToHtml(line) }} 
                    />
                  ))}
                </div>

                {/* Quick Chips & Command Bar */}
                <div className="p-3 bg-[#0d1424] border-t border-[#182338] space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 overflow-x-auto">
                    <span className="text-slate-500 font-sans">Quick:</span>
                    {['tps', 'spark tps', 'plugins', 'save-all', 'kill @e[type=item]'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleSendCommand(c)}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-800 transition-all cursor-pointer whitespace-nowrap"
                      >
                        /{c}
                      </button>
                    ))}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendCommand(commandInput);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/60 border border-slate-800 rounded-xl focus-within:border-cyan-500/50">
                      <span className="text-cyan-400 font-mono font-bold">&gt;</span>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        placeholder="Type a Minecraft server command (e.g. tps, help, gamemode survival)..."
                        className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Execute
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ================= TAB 3: BUG HUNTER & DIAGNOSTIC STUDIO ================= */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* Hero Banner */}
                <div className="p-6 bg-gradient-to-r from-red-950/30 via-[#101726] to-[#0d1522] rounded-2xl border border-red-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Bug className="w-4 h-4" />
                      Paper 1.21 Stack Trace Triage Engine
                    </div>
                    <h3 className="text-lg font-bold text-white">Automated Exception Isolation & Code Patching</h3>
                    <p className="text-xs text-slate-300 max-w-2xl mt-1">
                      Intercepts server crashes and NullPointerExceptions. Pinpoints the culprit plugin and exact source code line, generating ready-to-paste Java fixes.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerError}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <Bug className="w-4 h-4" />
                    Simulate Live Exception
                  </button>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {reports.map((report) => {
                    const isExpanded = expandedReportId === report.id;

                    return (
                      <div
                        key={report.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          report.resolved 
                            ? 'bg-slate-900/40 border-slate-800 opacity-60' 
                            : 'bg-[#0d1424] border-slate-800 hover:border-slate-700 shadow-xl'
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-red-950/50 border border-red-500/30 rounded-xl mt-0.5">
                              <AlertOctagon className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                                  {report.severity}
                                </span>
                                {report.culpritPlugin && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                                    Plugin: {report.culpritPlugin}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500 font-mono">
                                  {new Date(report.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200 font-mono">{report.errorType}</h4>
                              <p className="text-xs text-slate-400 line-clamp-1">{report.message}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {report.location && (
                              <span className="text-xs font-mono text-cyan-400 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
                                {report.location.fileName}:{report.location.lineNumber}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetch(`/api/diagnostics/${report.id}/resolve`, { method: 'POST' })
                                  .then(() => fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || [])));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                report.resolved ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                              }`}
                            >
                              {report.resolved ? 'Resolved' : 'Mark Fixed'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="p-6 border-t border-slate-800/80 bg-[#070b13] space-y-5">
                            {/* Root cause analysis */}
                            <div className="p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                Root Cause Diagnostic
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">{report.explanation}</p>
                              <p className="text-xs text-slate-300 pt-1">
                                <span className="text-cyan-400 font-bold">Recommended Fix:</span> {report.recommendedFix}
                              </p>
                            </div>

                            {/* Code Fix Snippet */}
                            {report.codeSnippet && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <Code2 className="w-4 h-4 text-emerald-400" />
                                    Suggested Java Fix ({report.location?.fileName || 'Plugin Source'})
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(report.codeSnippet!);
                                      setCopiedCodeId(report.id);
                                      setTimeout(() => setCopiedCodeId(null), 2000);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-all cursor-pointer"
                                  >
                                    {copiedCodeId === report.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedCodeId === report.id ? 'Copied!' : 'Copy Patch'}
                                  </button>
                                </div>
                                <pre className="p-4 bg-black/70 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto select-all">
                                  {report.codeSnippet}
                                </pre>
                              </div>
                            )}

                            {/* Stack Trace */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Raw Stack Trace
                              </span>
                              <div className="p-3 bg-black/50 border border-slate-800/80 rounded-xl font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto space-y-0.5 terminal-scroll select-text">
                                {report.stackTrace.map((line, lidx) => (
                                  <div 
                                    key={lidx}
                                    className={line.includes('com.efekoc') || line.includes('Aqua') ? 'text-cyan-400 font-bold bg-cyan-950/40 px-1 rounded' : ''}
                                  >
                                    {line}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 4: PLUGINS ================= */}
            {activeTab === 'plugins' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Installed Server Plugins ({plugins.length})</h3>
                    <p className="text-xs text-slate-400">Directly inspects plugin.yml inside each .jar without server reload.</p>
                  </div>
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md">
                    <Box className="w-3.5 h-3.5" />
                    Upload .jar
                    <input 
                      type="file" 
                      accept=".jar" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const formData = new FormData();
                          formData.append('file', e.target.files[0]);
                          fetch('/api/plugins/upload', { method: 'POST', body: formData })
                            .then(() => {
                              showToast('Uploaded plugin successfully!', 'success');
                              fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || []));
                            });
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plugins.map((plugin) => (
                    <div 
                      key={plugin.fileName}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        plugin.enabled ? 'bg-[#0d1424] border-slate-800' : 'bg-slate-950/50 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              {plugin.name}
                              {plugin.name.includes('Aqua') && (
                                <span className="p-0.5 rounded bg-cyan-950 text-cyan-400" title="Authored by efekkoc">
                                  <Sparkles className="w-3 h-3" />
                                </span>
                              )}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">v{plugin.version} • API {plugin.apiVersion}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            plugin.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {plugin.enabled ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{plugin.description}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          {(plugin.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePlugin(plugin.fileName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Toggle Enable / Disable"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              fetch(`/api/plugins/${plugin.fileName}`, { method: 'DELETE' })
                                .then(() => fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])));
                            }}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 cursor-pointer"
                            title="Delete Plugin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 5: DEVSYNC ================= */}
            {activeTab === 'devsync' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Dev-Sync & Hot-Swap Engine
                  </div>
                  <h3 className="text-base font-bold text-white">Automate ./gradlew build Deployment</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Watches your local project build directory (e.g. <code className="text-cyan-300 font-mono">/Users/efekoc/AquaFishing/build/libs</code>). Whenever a new jar is compiled, it is automatically hot-copied into the server plugins directory.
                  </p>
                </div>

                <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Watchers</h4>
                  {watchers.map((w) => (
                    <div key={w.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-white">{w.name}</span>
                        <p className="text-slate-400 font-mono text-[11px]">{w.sourceDirectory} &rarr; {w.targetPluginName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        MONITORING
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 6: CONFIG STUDIO ================= */}
            {activeTab === 'config' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">YAML Config Studio & Linter</h3>
                    <p className="text-xs text-slate-400">Prevents server crash from illegal tab indentation before rebooting.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFixIndentation}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 inline mr-1" />
                      Fix Indentation
                    </button>
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 inline mr-1" />
                      Save & Backup
                    </button>
                  </div>
                </div>

                <textarea
                  value={configContent}
                  onChange={(e) => setConfigContent(e.target.value)}
                  spellCheck={false}
                  className="w-full min-h-[500px] p-5 bg-[#05080e] rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none leading-relaxed terminal-scroll select-text"
                />
              </div>
            )}

            {/* ================= TAB 7: RESOURCE PACKS ================= */}
            {activeTab === 'resourcepack' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <PackageOpen className="w-4 h-4" />
                    Resource Pack CDN & SHA-1 Sync
                  </div>
                  <h3 className="text-base font-bold text-white">Built for AquaFishing RPG Textures & Bossbars</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Computes cryptographic SHA-1 hashes and automatically sets the download URL in <code className="text-cyan-300 font-mono">server.properties</code> so players prompt-download textures upon joining.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packs.map((pack) => (
                    <div key={pack.id} className="p-5 bg-[#0d1424] rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{pack.fileName}</span>
                        {pack.isApplied && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                            ACTIVE IN SERVER.PROPERTIES
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-slate-800 break-all">
                        SHA-1: {pack.sha1}
                      </p>
                      <button
                        onClick={() => {
                          fetch('/api/resourcepacks/apply', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileName: pack.fileName })
                          })
                            .then(r => r.json())
                            .then(d => {
                              showToast(d.message, 'success');
                              fetch('/api/resourcepacks').then(r => r.json()).then(res => setPacks(res.packs || []));
                            });
                        }}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                      >
                        1-Click Apply to server.properties
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
