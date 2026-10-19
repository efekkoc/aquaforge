import React from 'react';
import { Activity, Cpu, HardDrive, Users, CheckCircle, AlertTriangle, ArrowUpRight, Zap, Play } from 'lucide-react';
import { ServerMetrics, ServerStatus, DiagnosticReport, PluginMeta } from '../types';

interface DashboardViewProps {
  status: ServerStatus;
  metrics: ServerMetrics;
  reports: DiagnosticReport[];
  plugins: PluginMeta[];
  onStart: () => void;
  onNavigateToDiagnostics: () => void;
  onNavigateToPlugins: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  metrics,
  reports,
  plugins,
  onStart,
  onNavigateToDiagnostics,
  onNavigateToPlugins
}) => {
  const unresolvedReports = reports.filter(r => !r.resolved);
  const memoryPercentage = Math.round((metrics.memoryUsedMB / metrics.memoryMaxMB) * 100);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner if Unresolved Diagnostic Issues exist */}
      {unresolvedReports.length > 0 && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl flex items-center justify-between shadow-lg shadow-red-950/20">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-300">
                {unresolvedReports.length} Unresolved Exception{unresolvedReports.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-slate-300">
                Latest: <span className="font-mono text-red-400">{unresolvedReports[0].errorType}</span> in{' '}
                <span className="font-semibold text-white">{unresolvedReports[0].culpritPlugin || 'Server core'}</span>.
                AquaForge Diagnostic Engine has generated fix suggestions.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToDiagnostics}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Inspect in Bug Hunter
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TPS Gauge */}
        <div className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800/80 shadow-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tick Rate (TPS)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${metrics.tps >= 19.5 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {status === 'ONLINE' ? metrics.tps.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400">/ 20.0 max</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${status === 'ONLINE' ? (metrics.tps / 20) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            {metrics.tps >= 19.5 ? 'Perfect Server Tick Health' : 'Slight Tick Delay'}
          </p>
        </div>

        {/* MSPT Gauge */}
        <div className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800/80 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tick Duration (MSPT)</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${metrics.mspt < 25 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status === 'ONLINE' ? metrics.mspt.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400">ms (50ms budget)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
              style={{ width: `${status === 'ONLINE' ? (metrics.mspt / 50) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Tick headroom: <span className="text-emerald-400 font-semibold">{status === 'ONLINE' ? (50 - metrics.mspt).toFixed(1) : 50}ms</span> free
          </p>
        </div>

        {/* RAM Usage */}
        <div className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800/80 shadow-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">JVM Memory</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-300">
              {status === 'ONLINE' ? (metrics.memoryUsedMB / 1024).toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-400">GB / {(metrics.memoryMaxMB / 1024).toFixed(0)} GB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${status === 'ONLINE' ? memoryPercentage : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Heap utilization: <span className="text-purple-300 font-semibold">{status === 'ONLINE' ? memoryPercentage : 0}%</span>
          </p>
        </div>

        {/* CPU & Players */}
        <div className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800/80 shadow-md relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Players & CPU</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-blue-300">
              {status === 'ONLINE' ? metrics.onlinePlayers : 0}
            </span>
            <span className="text-xs text-slate-400">/ {metrics.maxPlayers} players</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${status === 'ONLINE' ? (metrics.onlinePlayers / metrics.maxPlayers) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>CPU load: <span className="text-blue-300 font-mono">{status === 'ONLINE' ? metrics.cpuPercent.toFixed(1) : 0}%</span></span>
            <span>Uptime: <span className="font-mono text-slate-300">{formatUptime(metrics.uptimeSeconds)}</span></span>
          </p>
        </div>
      </div>

      {/* Two Column Layout: Server Overview & Plugin Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Server Specifications & Architecture */}
        <div className="lg:col-span-2 p-6 bg-[#0e1524] rounded-2xl border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-200">Server Architecture & Environment</h3>
              <p className="text-xs text-slate-400">Paper 1.21.4 (Java 21 Virtual Machine)</p>
            </div>
            {status === 'OFFLINE' && (
              <button
                onClick={onStart}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Boot Instance
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Server Software</span>
              <span className="font-mono font-bold text-cyan-400">PaperMC 1.21.4</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Java Runtime</span>
              <span className="font-mono font-bold text-emerald-400">JDK 21 (Temurin)</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Garbage Collector</span>
              <span className="font-mono font-bold text-purple-400">G1GC (Aikar Flags)</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Server Port</span>
              <span className="font-mono font-bold text-slate-200">25565 (IPv4)</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Async Chunk Engine</span>
              <span className="font-mono font-bold text-slate-200">Regionized / Enabled</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Dev-Sync Status</span>
              <span className="font-mono font-bold text-cyan-400">Active (Chokidar)</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Startup Arguments</h4>
            <div className="p-2.5 bg-black/40 rounded-lg font-mono text-[11px] text-slate-300 break-all select-all">
              java -Xms2G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -jar paper.jar nogui
            </div>
          </div>
        </div>

        {/* Right 1 Col: Managed Plugins Summary */}
        <div className="p-6 bg-[#0e1524] rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Managed Plugins</h3>
            <button
              onClick={onNavigateToPlugins}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              View All ({plugins.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {plugins.slice(0, 5).map((plugin) => (
              <div
                key={plugin.fileName}
                className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 truncate">{plugin.name}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-800 text-slate-300 rounded">
                      {plugin.version}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{plugin.description}</p>
                </div>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    plugin.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {plugin.enabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
