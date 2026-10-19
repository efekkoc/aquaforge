import React, { useState, useEffect } from 'react';
import { RefreshCw, FolderSearch, Plus, CheckCircle, Power, Trash2, ArrowRight } from 'lucide-react';
import { DevSyncWatcher } from '../types';

export const DevSyncView: React.FC = () => {
  const [watchers, setWatchers] = useState<DevSyncWatcher[]>([]);
  const [newWatcherName, setNewWatcherName] = useState('AquaFishing Dev Watcher');
  const [newSourceDir, setNewSourceDir] = useState('/Users/efekoc/AquaFishing/build/libs');
  const [newTargetPlugin, setNewTargetPlugin] = useState('AquaFishing-1.0.0.jar');
  const [lastActivity, setLastActivity] = useState<string[]>([]);

  const fetchWatchers = () => {
    fetch('/api/devsync')
      .then(r => r.json())
      .then(d => {
        setWatchers(d.watchers || []);
        if ((d.watchers || []).length === 0) {
          // Add default preset for demo
          addDefaultPreset();
        }
      })
      .catch(() => {});
  };

  const addDefaultPreset = () => {
    fetch('/api/devsync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'watcher-aquafishing-1',
        name: 'AquaFishing Gradle Output',
        sourceDirectory: '/Users/efekoc/AquaFishing/build/libs',
        targetPluginName: 'AquaFishing-1.0.0.jar',
        active: true,
        autoReloadCommand: 'plugman reload AquaFishing'
      })
    }).then(() => fetchWatchers());
  };

  useEffect(() => {
    fetchWatchers();
  }, []);

  const handleCreateWatcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceDir) return;

    fetch('/api/devsync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `watcher-${Date.now()}`,
        name: newWatcherName,
        sourceDirectory: newSourceDir,
        targetPluginName: newTargetPlugin,
        active: true,
        autoReloadCommand: 'plugman reload AquaFishing'
      })
    })
      .then(r => r.json())
      .then(() => {
        fetchWatchers();
        setLastActivity(prev => [`[${new Date().toLocaleTimeString()}] Registered new build watcher: ${newWatcherName}`, ...prev]);
      });
  };

  const handleToggle = (id: string) => {
    fetch(`/api/devsync/${id}/toggle`, { method: 'POST' })
      .then(() => fetchWatchers());
  };

  const handleDelete = (id: string) => {
    fetch(`/api/devsync/${id}`, { method: 'DELETE' })
      .then(() => fetchWatchers());
  };

  return (
    <div className="space-y-6">
      {/* DevSync Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0c1724] to-[#131f32] rounded-2xl border border-cyan-800/40 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </span>
          <h2 className="text-lg font-bold text-slate-100">Live Dev-Sync & Hot-Swap Engine</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Eradicate manual jar dragging. Watch your local project's <code className="text-cyan-300 font-mono">build/libs/</code> directory in real-time. Whenever you run <code className="text-cyan-300 font-mono">./gradlew build</code> on your Mac, the updated jar is instantly deployed into the server plugins folder.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watcher Configuration Form */}
        <div className="p-6 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Add Build Watcher
          </h3>

          <form onSubmit={handleCreateWatcher} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Watcher Label</label>
              <input
                type="text"
                value={newWatcherName}
                onChange={(e) => setNewWatcherName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Local Build Directory (Gradle/Maven output)
              </label>
              <input
                type="text"
                value={newSourceDir}
                onChange={(e) => setNewSourceDir(e.target.value)}
                placeholder="/Users/.../build/libs"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Plugin Name</label>
              <input
                type="text"
                value={newTargetPlugin}
                onChange={(e) => setNewTargetPlugin(e.target.value)}
                placeholder="AquaFishing-1.0.0.jar"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-cyan-600/20 transition-all"
            >
              Start Monitoring Folder
            </button>
          </form>
        </div>

        {/* Active Watchers & Recent Sync Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Active Directory Watchers ({watchers.length})</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Chokidar FS Active
              </span>
            </h3>

            {watchers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No directory watchers currently active.</p>
            ) : (
              <div className="space-y-3">
                {watchers.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{w.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            w.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {w.active ? 'LISTENING' : 'PAUSED'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <FolderSearch className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate max-w-sm">{w.sourceDirectory}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-slate-200">{w.targetPluginName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(w.id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          w.active
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title={w.active ? 'Pause Watcher' : 'Resume Watcher'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-red-950/40 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                        title="Delete Watcher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Terminal */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-1 text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Sync Activity Log
            </span>
            <div className="text-emerald-400">
              [SYSTEM] Dev-Sync daemon listening for Gradle artifact builds...
            </div>
            {lastActivity.map((log, idx) => (
              <div key={idx} className="text-cyan-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
