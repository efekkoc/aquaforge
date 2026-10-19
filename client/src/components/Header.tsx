import React from 'react';
import { Play, Square, RotateCw, Skull, Server, Activity, Users, Cpu } from 'lucide-react';
import { ServerStatus, ServerMetrics } from '../types';

interface HeaderProps {
  status: ServerStatus;
  metrics: ServerMetrics;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onKill: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  metrics,
  onStart,
  onStop,
  onRestart,
  onKill
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE (Paper 1.21.4)
          </span>
        );
      case 'STARTING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            BOOTING...
          </span>
        );
      case 'STOPPING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            STOPPING
          </span>
        );
      case 'CRASHED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            CRASH DETECTED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            OFFLINE
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AquaForge
              </h1>
              <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                v1.0 DevSuite
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Paper 1.21 Orchestrator & Diagnostic Hub</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
        {getStatusBadge()}
      </div>

      {/* Middle Quick HUD */}
      {status === 'ONLINE' && (
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">TPS:</span>
            <span className="font-bold">{metrics.tps.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">MSPT:</span>
            <span className="font-bold text-emerald-400">{metrics.mspt.toFixed(1)}ms</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">RAM:</span>
            <span className="font-bold text-purple-300">
              {metrics.memoryUsedMB}MB / {metrics.memoryMaxMB}MB
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Players:</span>
            <span className="font-bold text-amber-300">{metrics.onlinePlayers} / {metrics.maxPlayers}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {status === 'OFFLINE' ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Start Server
          </button>
        ) : (
          <>
            <button
              onClick={onStop}
              disabled={status === 'STOPPING'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-amber-400" />
              Stop
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Restart
            </button>
            <button
              onClick={onKill}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Force Kill Process (SIGKILL)"
            >
              <Skull className="w-3.5 h-3.5" />
              Kill
            </button>
          </>
        )}
      </div>
    </header>
  );
};
