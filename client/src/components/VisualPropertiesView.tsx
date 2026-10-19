import React, { useState, useEffect } from 'react';
import { 
  Sliders, Shield, Save, RotateCcw, Check, Sparkles, Swords, 
  Eye, Cpu, Users, Globe, Lock, Play, Flame
} from 'lucide-react';

interface VisualPropertiesViewProps {
  showToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const VisualPropertiesView: React.FC<VisualPropertiesViewProps> = ({ showToast }) => {
  const [props, setProps] = useState<Record<string, any>>({
    'server-port': 25565,
    'max-players': 50,
    'gamemode': 'survival',
    'difficulty': 'normal',
    'pvp': true,
    'allow-flight': false,
    'enable-command-block': true,
    'spawn-monsters': true,
    'spawn-animals': true,
    'view-distance': 10,
    'simulation-distance': 8,
    'online-mode': true,
    'white-list': false,
    'motd': '§b§lAQUAFORGE §7Server §f- Powered by efekkoc'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/properties')
      .then(r => r.json())
      .then(d => {
        if (d.properties) setProps(d.properties);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: props })
    })
      .then(r => r.json())
      .then(d => {
        setSaving(false);
        if (d.success) {
          showToast('server.properties successfully saved & backed up!', 'success');
        } else {
          showToast('Failed to save server.properties', 'error');
        }
      })
      .catch(() => {
        setSaving(false);
        showToast('Error communicating with server', 'error');
      });
  };

  // Helper to render Minecraft color codes in motd preview
  const renderMinecraftColorText = (text: string) => {
    if (!text) return 'Minecraft Server';
    // Replace standard section sign color codes with spans
    const parts = text.split(/§([0-9a-fk-or])/g);
    let currentColor = '#ffffff';
    let isBold = false;
    const elements: React.ReactNode[] = [];

    const colorMap: Record<string, string> = {
      '0': '#000000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa',
      '4': '#aa0000', '5': '#aa00aa', '6': '#ffaa00', '7': '#aaaaaa',
      '8': '#555555', '9': '#5555ff', 'a': '#55ff55', 'b': '#55ffff',
      'c': '#ff5555', 'd': '#ff55ff', 'e': '#ffff55', 'f': '#ffffff'
    };

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        const code = parts[i].toLowerCase();
        if (code === 'l') isBold = true;
        else if (code === 'r') { currentColor = '#ffffff'; isBold = false; }
        else if (colorMap[code]) { currentColor = colorMap[code]; }
      } else if (parts[i]) {
        elements.push(
          <span key={i} style={{ color: currentColor, fontWeight: isBold ? 'bold' : 'normal' }}>
            {parts[i]}
          </span>
        );
      }
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            Visual server.properties & Performance Studio
          </div>
          <h3 className="text-lg font-black text-white">
            Safe No-Code Config Editor for Server Administrators
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Eliminates YAML syntax crashes and typos. Sliders and toggles automatically write to <code className="text-cyan-300 font-mono">server.properties</code> and generate auto-backups on each save.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save & Sync Properties'}
        </button>
      </div>

      {/* MOTD Live Preview Box */}
      <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          Server MOTD (Message of the Day) & Multiplayer Preview
        </label>
        
        <input
          type="text"
          value={props['motd'] || ''}
          onChange={(e) => setProps({ ...props, motd: e.target.value })}
          placeholder="§b§lAQUAFORGE §7Server §f- Powered by efekkoc"
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
        />

        {/* Live In-Game Multiplayer Ping Card Preview */}
        <div className="p-4 bg-black/80 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center font-bold text-cyan-400 text-xs shadow-inner">
              MC
            </div>
            <div>
              <div className="font-bold text-sm text-slate-200">AquaForge Server</div>
              <div className="text-xs font-mono font-medium mt-0.5">
                {renderMinecraftColorText(props['motd'] || '')}
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">5 / {props['max-players'] || 50}</span>
            <span className="block text-[10px] text-slate-500">Ping 24ms</span>
          </div>
        </div>
      </div>

      {/* Toggles & Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: Core Gameplay */}
        <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-emerald-400" />
            Gameplay Rules
          </h4>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Game Mode</label>
            <select
              value={props['gamemode'] || 'survival'}
              onChange={(e) => setProps({ ...props, gamemode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="survival">Survival</option>
              <option value="creative">Creative</option>
              <option value="adventure">Adventure</option>
              <option value="spectator">Spectator</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Difficulty</label>
            <select
              value={props['difficulty'] || 'normal'}
              onChange={(e) => setProps({ ...props, difficulty: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="peaceful">Peaceful</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Player vs Player (PvP)</span>
              <input
                type="checkbox"
                checked={!!props['pvp']}
                onChange={(e) => setProps({ ...props, pvp: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Allow Flight</span>
              <input
                type="checkbox"
                checked={!!props['allow-flight']}
                onChange={(e) => setProps({ ...props, 'allow-flight': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Command Blocks</span>
              <input
                type="checkbox"
                checked={!!props['enable-command-block']}
                onChange={(e) => setProps({ ...props, 'enable-command-block': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Card 2: Performance & Chunk Render Tuning */}
        <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Performance & Chunks
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">View Distance</span>
              <span className="font-bold text-cyan-400 font-mono">{props['view-distance'] || 10} Chunks</span>
            </div>
            <input
              type="range"
              min={4}
              max={32}
              value={props['view-distance'] || 10}
              onChange={(e) => setProps({ ...props, 'view-distance': parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Lower to 6-8 for high player counts to eliminate lag.</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Simulation Distance</span>
              <span className="font-bold text-cyan-400 font-mono">{props['simulation-distance'] || 8} Chunks</span>
            </div>
            <input
              type="range"
              min={4}
              max={16}
              value={props['simulation-distance'] || 8}
              onChange={(e) => setProps({ ...props, 'simulation-distance': parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Controls entity tick radius. Highly effective for MSPT tuning.</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Spawn Monsters</span>
              <input
                type="checkbox"
                checked={props['spawn-monsters'] !== false}
                onChange={(e) => setProps({ ...props, 'spawn-monsters': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Spawn Animals</span>
              <input
                type="checkbox"
                checked={props['spawn-animals'] !== false}
                onChange={(e) => setProps({ ...props, 'spawn-animals': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Card 3: Security & Network */}
        <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Security & Slots
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Max Player Slots</span>
              <span className="font-bold text-amber-300 font-mono">{props['max-players'] || 50}</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              value={props['max-players'] || 50}
              onChange={(e) => setProps({ ...props, 'max-players': parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Server Port</label>
            <input
              type="number"
              value={props['server-port'] || 25565}
              onChange={(e) => setProps({ ...props, 'server-port': parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs text-slate-300 block">Online Mode</span>
                <span className="text-[10px] text-slate-500">Require official Mojang authentication</span>
              </div>
              <input
                type="checkbox"
                checked={!!props['online-mode']}
                onChange={(e) => setProps({ ...props, 'online-mode': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs text-slate-300 block">Whitelist</span>
                <span className="text-[10px] text-slate-500">Only permitted players can connect</span>
              </div>
              <input
                type="checkbox"
                checked={!!props['white-list']}
                onChange={(e) => setProps({ ...props, 'white-list': e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
