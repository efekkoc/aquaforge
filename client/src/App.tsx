import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ConsoleView } from './components/ConsoleView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { PluginsView } from './components/PluginsView';
import { DevSyncView } from './components/DevSyncView';
import { ConfigView } from './components/ConfigView';
import { ResourcePackView } from './components/ResourcePackView';
import { ServerStatus, ServerMetrics, DiagnosticReport, PluginMeta } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [status, setStatus] = useState<ServerStatus>('OFFLINE');
  const [metrics, setMetrics] = useState<ServerMetrics>({
    tps: 20.0,
    mspt: 11.2,
    memoryUsedMB: 1240,
    memoryMaxMB: 4096,
    cpuPercent: 4.8,
    onlinePlayers: 3,
    maxPlayers: 50,
    uptimeSeconds: 0
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [plugins, setPlugins] = useState<PluginMeta[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  const fetchInitialData = () => {
    fetch('/api/server/status')
      .then(r => r.json())
      .then(d => {
        if (d.status) setStatus(d.status);
        if (d.metrics) setMetrics(d.metrics);
      })
      .catch(() => {});

    fetch('/api/server/logs')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => {});

    fetch('/api/diagnostics')
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .catch(() => {});

    fetch('/api/plugins')
      .then(r => r.json())
      .then(d => setPlugins(d.plugins || []))
      .catch(() => {});
  };

  // WebSocket Connection
  useEffect(() => {
    fetchInitialData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Handle both Vite dev proxy and direct backend connection
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWs = () => {
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onmessage = (event) => {
          try {
            const { type, data } = JSON.parse(event.data);
            if (type === 'init') {
              setStatus(data.status);
              setMetrics(data.metrics);
              setLogs(data.logs || []);
            } else if (type === 'console_log') {
              setLogs(prev => [...prev, data.line]);
              // Refresh diagnostics if log contained an exception
              if (data.line.includes('Exception') || data.line.includes('Error')) {
                fetch('/api/diagnostics')
                  .then(r => r.json())
                  .then(d => setReports(d.reports || []));
              }
            } else if (type === 'metrics_update') {
              setMetrics(data);
            } else if (type === 'status_change') {
              setStatus(data.status);
            } else if (type === 'devsync_trigger') {
              showToast(`${data.watcherName}: ${data.message}`, 'success');
              // Reload plugins
              fetch('/api/plugins')
                .then(r => r.json())
                .then(d => setPlugins(d.plugins || []));
            }
          } catch (e) {}
        };

        socket.onclose = () => {
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Server Controls
  const handleStart = () => {
    fetch('/api/server/start', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        showToast(res.message, res.success ? 'success' : 'error');
        fetchInitialData();
      });
  };

  const handleStop = () => {
    fetch('/api/server/stop', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        showToast(res.message, 'info');
        fetchInitialData();
      });
  };

  const handleRestart = () => {
    fetch('/api/server/restart', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        showToast(res.message, 'info');
        fetchInitialData();
      });
  };

  const handleKill = () => {
    fetch('/api/server/kill', { method: 'POST' })
      .then(r => r.json())
      .then(res => {
        showToast(res.message, 'error');
        fetchInitialData();
      });
  };

  const handleSendCommand = (cmd: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', data: cmd }));
    } else {
      fetch('/api/server/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
    }
  };

  const handleTriggerTestError = () => {
    fetch('/api/server/trigger-error', { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        showToast('Injected test exception into console! Inspecting in Bug Hunter...', 'info');
        setTimeout(() => {
          fetch('/api/diagnostics')
            .then(r => r.json())
            .then(d => setReports(d.reports || []));
        }, 300);
      });
  };

  // Diagnostics Controls
  const handleResolveDiagnostic = (id: string) => {
    fetch(`/api/diagnostics/${id}/resolve`, { method: 'POST' })
      .then(() => {
        setReports(prev =>
          prev.map(r => (r.id === id ? { ...r, resolved: !r.resolved } : r))
        );
      });
  };

  const handleClearDiagnostics = () => {
    fetch('/api/diagnostics/clear', { method: 'POST' })
      .then(() => setReports([]));
  };

  // Plugin Controls
  const handleTogglePlugin = (fileName: string) => {
    fetch(`/api/plugins/${fileName}/toggle`, { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        fetch('/api/plugins')
          .then(r => r.json())
          .then(d => setPlugins(d.plugins || []));
      });
  };

  const handleDeletePlugin = (fileName: string) => {
    fetch(`/api/plugins/${fileName}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => {
        showToast(`Deleted ${fileName}`, 'info');
        fetch('/api/plugins')
          .then(r => r.json())
          .then(d => setPlugins(d.plugins || []));
      });
  };

  const handleUploadPlugin = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/plugins/upload', {
      method: 'POST',
      body: formData
    })
      .then(r => r.json())
      .then(d => {
        showToast(`Uploaded ${d.fileName} to plugins/`, 'success');
        fetch('/api/plugins')
          .then(r => r.json())
          .then(data => setPlugins(data.plugins || []));
      });
  };

  const handleInstallMarketplacePlugin = async (fileName: string, downloadUrl?: string) => {
    const res = await fetch('/api/marketplace/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, downloadUrl })
    });
    const d = await res.json();
    showToast(d.message, d.success ? 'success' : 'error');
    const plRes = await fetch('/api/plugins');
    const plData = await plRes.json();
    setPlugins(plData.plugins || []);
  };

  const unresolvedCount = reports.filter(r => !r.resolved).length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/50'
              : notification.type === 'error'
              ? 'bg-red-950/90 text-red-300 border-red-600/50'
              : 'bg-cyan-950/90 text-cyan-300 border-cyan-600/50'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        status={status}
        metrics={metrics}
        onStart={handleStart}
        onStop={handleStop}
        onRestart={handleRestart}
        onKill={handleKill}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unresolvedErrorsCount={unresolvedCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              status={status}
              metrics={metrics}
              reports={reports}
              plugins={plugins}
              onStart={handleStart}
              onNavigateToDiagnostics={() => setActiveTab('diagnostics')}
              onNavigateToPlugins={() => setActiveTab('plugins')}
            />
          )}

          {activeTab === 'console' && (
            <ConsoleView
              logs={logs}
              onSendCommand={handleSendCommand}
              onClearLogs={() => setLogs([])}
              onTriggerTestError={handleTriggerTestError}
            />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticsView
              reports={reports}
              onResolve={handleResolveDiagnostic}
              onClear={handleClearDiagnostics}
              onTriggerTestError={handleTriggerTestError}
            />
          )}

          {activeTab === 'plugins' && (
            <PluginsView
              plugins={plugins}
              onTogglePlugin={handleTogglePlugin}
              onDeletePlugin={handleDeletePlugin}
              onUploadPlugin={handleUploadPlugin}
              onInstallMarketplacePlugin={handleInstallMarketplacePlugin}
            />
          )}

          {activeTab === 'devsync' && <DevSyncView />}

          {activeTab === 'configs' && <ConfigView />}

          {activeTab === 'resourcepacks' && <ResourcePackView />}
        </main>
      </div>
    </div>
  );
};
