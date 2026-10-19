import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Map as MapIcon, Users, ZoomIn, ZoomOut, Maximize2, 
  ExternalLink, Sparkles, Crosshair, Sun, Moon, CloudRain, Shield, Navigation
} from 'lucide-react';
import { WorldRadarPlayer } from '../types';

interface AquaMapRadarViewProps {
  serverStatus: string;
}

export const AquaMapRadarView: React.FC<AquaMapRadarViewProps> = ({ serverStatus }) => {
  const [world, setWorld] = useState<'world' | 'world_nether' | 'world_the_end'>('world');
  const [zoom, setZoom] = useState<number>(1.2);
  const [selectedPlayer, setSelectedPlayer] = useState<WorldRadarPlayer | null>(null);
  const [players, setPlayers] = useState<WorldRadarPlayer[]>([
    { id: '1', name: 'efekkoc', x: 145, y: 72, z: -210, world: 'world', health: 20, gamemode: 'SURVIVAL', ping: 14 },
    { id: '2', name: 'Alex_Explorer', x: -64, y: 65, z: 128, world: 'world', health: 18, gamemode: 'SURVIVAL', ping: 28 },
    { id: '3', name: 'PaperGuard', x: 20, y: 110, z: 15, world: 'world', health: 20, gamemode: 'CREATIVE', ping: 9 }
  ]);
  const [centerCoord, setCenterCoord] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch real/mock radar players from server
  useEffect(() => {
    fetch('/api/radar/players')
      .then(r => r.json())
      .then(d => {
        if (d.players && d.players.length > 0) {
          setPlayers(d.players);
        }
      })
      .catch(() => {});
  }, [serverStatus]);

  // Canvas Radar Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear background
    ctx.fillStyle = world === 'world_nether' ? '#1c0808' : world === 'world_the_end' ? '#0d0817' : '#08121e';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = world === 'world_nether' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.12)';
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;

    const offsetX = (centerX - centerCoord.x * zoom) % gridSize;
    const offsetY = (centerY - centerCoord.z * zoom) % gridSize;

    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // World Spawn Marker (0,0)
    const spawnScreenX = centerX + (0 - centerCoord.x) * zoom;
    const spawnScreenY = centerY + (0 - centerCoord.z) * zoom;
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.beginPath();
    ctx.arc(spawnScreenX, spawnScreenY, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#eab308';
    ctx.font = '10px monospace';
    ctx.fillText('Spawn (0,0)', spawnScreenX + 10, spawnScreenY + 3);

    // Draw Radar Sweeping Rings
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.setLineDash([4, 4]);
    [80, 160, 240, 320].forEach(r => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * (zoom / 1.2), 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw Crosshair Center
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY);
    ctx.lineTo(centerX + 15, centerY);
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();

    // Render Players
    players.forEach(p => {
      const screenX = centerX + (p.x - centerCoord.x) * zoom;
      const screenY = centerY + (p.z - centerCoord.z) * zoom;

      const isCurrentSelected = selectedPlayer?.id === p.id;

      // Outer glow circle
      ctx.fillStyle = isCurrentSelected ? 'rgba(52, 211, 153, 0.4)' : p.name === 'efekkoc' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(168, 85, 247, 0.3)';
      ctx.beginPath();
      ctx.arc(screenX, screenY, isCurrentSelected ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();

      // Pin center
      ctx.fillStyle = isCurrentSelected ? '#34d399' : p.name === 'efekkoc' ? '#22d3ee' : '#c084fc';
      ctx.beginPath();
      ctx.arc(screenX, screenY, isCurrentSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Name & coords
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(p.name, screenX + 10, screenY - 2);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`X:${p.x} Z:${p.z}`, screenX + 10, screenY + 11);
    });
  }, [players, zoom, centerCoord, world, selectedPlayer]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AquaMap Spotlight Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/50 via-[#0d1626] to-[#09111e] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            AquaMap Live World Radar & Minimap
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/80 text-cyan-300 font-mono border border-cyan-700/60">
              Showcasing AquaMap
            </span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            Real-Time 2D Player Radar & Dynamic Telemetry
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Directly connected to <span className="text-cyan-300 font-bold">AquaMap</span> (authored by efekkoc). 
            Visualizes player coordinates, spawn points, and active dimension tracking without leaving your browser studio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/efekkoc/AquaMap"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            View AquaMap Repo
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Radar Screen & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Radar Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-[#070d18] overflow-hidden shadow-2xl relative">
          
          {/* Top Canvas Controls Bar */}
          <div className="p-4 bg-[#0a1220]/90 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10 relative">
            
            {/* Dimension Selector */}
            <div className="flex p-0.5 bg-[#0e1626] rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setWorld('world')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  world === 'world' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overworld
              </button>
              <button
                onClick={() => setWorld('world_nether')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  world === 'world_nether' ? 'bg-red-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                The Nether
              </button>
              <button
                onClick={() => setWorld('world_the_end')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  world === 'world_the_end' ? 'bg-purple-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                The End
              </button>
            </div>

            {/* Time / Weather Pills */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                <Sun className="w-3.5 h-3.5" />
                12:40 Day
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                <CloudRain className="w-3.5 h-3.5" />
                Clear
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.3, 3))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1">{(zoom * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.4))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setCenterCoord({ x: 0, z: 0 }); setSelectedPlayer(null); }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-cyan-400 ml-1"
                title="Recenter at Spawn (0,0)"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <div className="relative h-[480px] w-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={480}
              className="w-full h-full cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const canvasW = rect.width;
                const canvasH = rect.height;
                const worldClickX = Math.round(centerCoord.x + (clickX - canvasW / 2) / zoom);
                const worldClickZ = Math.round(centerCoord.z + (clickY - canvasH / 2) / zoom);
                setCenterCoord({ x: worldClickX, z: worldClickZ });
              }}
            />

            {/* Compass HUD Indicator (Top Right) */}
            <div className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-2xl border border-slate-800 text-center font-mono pointer-events-none">
              <span className="text-xs font-bold text-red-400 block">N</span>
              <div className="w-7 h-7 mx-auto my-0.5 border border-slate-700 rounded-full flex items-center justify-center">
                <Navigation className="w-4 h-4 text-cyan-400 rotate-45" />
              </div>
              <span className="text-[10px] text-slate-400 block">Compass</span>
            </div>

            {/* Bottom Coordinates Bar */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none flex items-center gap-3">
              <span>Center: <span className="text-cyan-300 font-bold">X: {centerCoord.x}</span>, <span className="text-cyan-300 font-bold">Z: {centerCoord.z}</span></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Click map to pan</span>
            </div>
          </div>
        </div>

        {/* Players Radar Tracking Panel (1 col) */}
        <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Tracked Players ({players.length})
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {players.map(p => {
                const isSelected = selectedPlayer?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setCenterCoord({ x: p.x, z: p.z });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-lg' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.name === 'efekkoc' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{p.ping}ms</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                      <span>X: <span className="text-slate-200">{p.x}</span> Z: <span className="text-slate-200">{p.z}</span></span>
                      <span className="text-emerald-400 font-bold">{p.health} ❤️</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Player Teleport / Ping Action */}
          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-900/40 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 block">AquaMap Radar Tip</span>
            <p className="text-[10px] text-slate-400">
              Click any player card to immediately center radar crosshairs on their coordinates.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
