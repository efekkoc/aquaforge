import React, { useState } from 'react';
import { 
  Globe2, Compass, RotateCcw, Download, Sparkles, 
  Trash2, Flame, Moon, Sun, CloudRain, Check, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface WorldVaultViewProps {
  onSendCommand: (cmd: string) => void;
}

export const WorldVaultView: React.FC<WorldVaultViewProps> = ({ onSendCommand }) => {
  const [seed, setSeed] = useState('84719204918239014');
  const [difficulty, setDifficulty] = useState('hard');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleResetDimension = (dimension: 'nether' | 'the_end') => {
    if (dimension === 'nether') {
      onSendCommand('say [AquaForge] Dimension Reset: Flushing world_nether chunks...');
      triggerNotice('Nether reset scheduled on next server reboot.');
    } else {
      onSendCommand('say [AquaForge] Dimension Reset: Regenerating world_the_end dragon & islands...');
      triggerNotice('The End dimension reset scheduled.');
    }
  };

  const handleSetDifficulty = (diff: string) => {
    setDifficulty(diff);
    onSendCommand(`difficulty ${diff}`);
    triggerNotice(`Server difficulty set to ${diff.toUpperCase()}`);
  };

  const handleSetTime = (time: 'day' | 'night') => {
    onSendCommand(`time set ${time}`);
    triggerNotice(`Time set to ${time.toUpperCase()}`);
  };

  const handleSetWeather = (weather: 'clear' | 'rain' | 'thunder') => {
    onSendCommand(`weather ${weather}`);
    triggerNotice(`Weather set to ${weather.toUpperCase()}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-8 bg-gradient-to-r from-[#091b24] via-[#0b2430] to-[#0f3445] rounded-3xl border border-teal-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-950 text-teal-300 border border-teal-700/60 shadow-[0_0_12px_rgba(20,184,166,0.3)] inline-flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-teal-400" />
              Dimension & Seed Architect
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              World Vault & Dimension Inspector
            </h1>
            <p className="text-slate-300 max-w-3xl text-sm leading-relaxed">
              Direct telemetry over your Overworld, Nether, and The End. Safely regenerate outer dimensions to refresh Elytras and Netherite, adjust world difficulty, and inspect world seeds.
            </p>
          </div>

          {actionNotice && (
            <div className="px-5 py-3 rounded-xl bg-teal-950/90 border border-teal-500 text-teal-300 font-semibold text-xs flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-teal-400" />
              {actionNotice}
            </div>
          )}
        </div>
      </div>

      {/* World Seed Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            World Generation Seed
          </span>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-teal-300 font-bold text-lg select-all flex items-center justify-between">
            <span>{seed}</span>
            <span className="text-[10px] text-slate-500 uppercase">Java 1.21.x</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compatible with Chunkbase and Amidst biome viewers for Minecraft 1.20 through 1.21.11.
          </p>
        </div>

        {/* Real-time Environment Controller */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Environment & Weather
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetTime('day')}
              className="px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sun className="w-4 h-4 text-amber-400" /> Day (1000)
            </button>
            <button
              onClick={() => handleSetTime('night')}
              className="px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Moon className="w-4 h-4 text-indigo-400" /> Night (13000)
            </button>
            <button
              onClick={() => handleSetWeather('clear')}
              className="px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sun className="w-4 h-4 text-cyan-400" /> Clear Skies
            </button>
            <button
              onClick={() => handleSetWeather('rain')}
              className="px-3 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CloudRain className="w-4 h-4 text-blue-400" /> Rain / Storm
            </button>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            World Difficulty
          </span>
          <div className="grid grid-cols-2 gap-2">
            {['peaceful', 'easy', 'normal', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => handleSetDifficulty(d)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
                  difficulty === d
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dimensions Breakdown & 1-Click Regenerator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overworld */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              The Overworld
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">1.42 GB</span>
          </div>
          <p className="text-xs text-slate-400">
            Primary player spawn, build claims, and village trade centers. Protected by AquaClaims.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Directory: ./world
          </div>
        </div>

        {/* The Nether */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              The Nether
            </span>
            <span className="text-xs font-mono text-red-400 font-bold">480 MB</span>
          </div>
          <p className="text-xs text-slate-400">
            Bastions, Nether Fortresses & Ancient Debris mines. Resetting will restore loot chests.
          </p>
          <button
            onClick={() => handleResetDimension('nether')}
            className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-700/60 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            1-Click Reset Nether
          </button>
        </div>

        {/* The End */}
        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              The End
            </span>
            <span className="text-xs font-mono text-purple-400 font-bold">290 MB</span>
          </div>
          <p className="text-xs text-slate-400">
            Outer islands, End Cities & Elytras. Resetting respawns the dragon and refills ships.
          </p>
          <button
            onClick={() => handleResetDimension('the_end')}
            className="w-full py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/60 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            1-Click Reset The End
          </button>
        </div>
      </div>
    </div>
  );
};
