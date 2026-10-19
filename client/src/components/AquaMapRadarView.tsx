import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Map as MapIcon, Users, ZoomIn, ZoomOut, Maximize2, 
  ExternalLink, Sparkles, Crosshair, Sun, Moon, CloudRain, Shield, Navigation,
  Activity, PowerOff
} from 'lucide-react';
import { WorldRadarPlayer } from '../types';

interface AquaMapRadarViewProps {
  serverStatus: string;
}

export const AquaMapRadarView: React.FC<AquaMapRadarViewProps> = ({ serverStatus }) => {
  const [world, setWorld] = useState<'world' | 'world_nether' | 'world_the_end'>('world');
  const [zoom, setZoom] = useState<number>(1.2);
  const [selectedPlayer, setSelectedPlayer] = useState<WorldRadarPlayer | null>(null);
  
  // Clean state: absolutely NO dummy players when server is not running!
  const [players, setPlayers] = useState<WorldRadarPlayer[]>([]);
  const [centerCoord, setCenterCoord] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startCenterX: number; startCenterZ: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Fetch real radar players from server ONLY when online
  useEffect(() => {
    if (serverStatus !== 'ONLINE') {
      setPlayers([]);
      setSelectedPlayer(null);
      return;
    }

    const fetchPlayers = () => {
      fetch('/api/radar/players')
        .then(r => r.json())
        .then(d => {
          if (d.players) {
            setPlayers(d.players);
          } else {
            setPlayers([]);
          }
        })
        .catch(() => setPlayers([]));
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, [serverStatus]);

  // Ultra-fluid 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Handle high-DPI crisp rendering
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Background by dimension
      ctx.fillStyle = world === 'world_nether' ? '#120505' : world === 'world_the_end' ? '#0a0614' : '#060d17';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      const gridSize = 45 * zoom;
      const offsetX = (centerX - centerCoord.x * zoom) % gridSize;
      const offsetY = (centerY - centerCoord.z * zoom) % gridSize;

      ctx.strokeStyle = world === 'world_nether' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(6, 182, 212, 0.1)';
      ctx.lineWidth = 1;

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

      // Radar Concentric Range Rings
      const maxRadius = Math.max(width, height);
      ctx.lineWidth = 1;
      [80, 160, 260, 380].forEach((r, idx) => {
        const ringR = r * (zoom / 1.2);
        if (ringR < maxRadius) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
          ctx.stroke();

          // Distance labels
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.font = '9px monospace';
          ctx.fillText(`${Math.round(r)}m`, centerX + 4, centerY - ringR + 11);
        }
      });
      ctx.setLineDash([]);

      // Rotating Radar Sweep Beam (60 FPS smooth rotation)
      sweepAngleRef.current += 0.02;
      const sweepAngle = sweepAngleRef.current;
      const sweepRadius = Math.max(width, height) * 0.8;

      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, sweepRadius);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, sweepRadius, sweepAngle - 0.35, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Main Radar Beam Line
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * sweepRadius, centerY + Math.sin(sweepAngle) * sweepRadius);
      ctx.stroke();

      // Spawn Marker (0,0)
      const spawnScreenX = centerX + (0 - centerCoord.x) * zoom;
      const spawnScreenY = centerY + (0 - centerCoord.z) * zoom;

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(spawnScreenX, spawnScreenY, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Spawn (0,0)', spawnScreenX + 8, spawnScreenY + 3);

      // Render Active Players (Only if server is online and players exist)
      if (serverStatus === 'ONLINE' && players.length > 0) {
        players.forEach(p => {
          const screenX = centerX + (p.x - centerCoord.x) * zoom;
          const screenY = centerY + (p.z - centerCoord.z) * zoom;

          const isSelected = selectedPlayer?.id === p.id;

          // Pulse glow ring
          ctx.fillStyle = isSelected ? 'rgba(52, 211, 153, 0.35)' : 'rgba(34, 211, 238, 0.3)';
          ctx.beginPath();
          ctx.arc(screenX, screenY, isSelected ? 12 : 9, 0, Math.PI * 2);
          ctx.fill();

          // Pin marker dot
          ctx.fillStyle = isSelected ? '#34d399' : '#22d3ee';
          ctx.beginPath();
          ctx.arc(screenX, screenY, isSelected ? 6 : 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Text tag with background pill
          ctx.fillStyle = 'rgba(10, 15, 24, 0.85)';
          ctx.fillRect(screenX + 8, screenY - 14, 85, 26);
          ctx.strokeStyle = isSelected ? '#34d399' : 'rgba(34, 211, 238, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX + 8, screenY - 14, 85, 26);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(p.name, screenX + 12, screenY - 2);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px monospace';
          ctx.fillText(`${p.x}, ${p.z}`, screenX + 12, screenY + 9);
        });
      } else {
        // Offline / Standby Watermark
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AQUAMAP RADAR • STANDBY SCANNING', centerX, centerY + 50);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.fillText('Launch server to track connected players in real-time', centerX, centerY + 68);
        ctx.textAlign = 'left';
      }

      // Center Crosshair
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [players, zoom, centerCoord, world, selectedPlayer, serverStatus]);

  // Smooth mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startCenterX: centerCoord.x,
      startCenterZ: centerCoord.z
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setCenterCoord({
      x: Math.round(dragStartRef.current.startCenterX - dx / zoom),
      z: Math.round(dragStartRef.current.startCenterZ - dy / zoom)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 3.5));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AquaMap Spotlight Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/50 via-[#0d1626] to-[#09111e] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            AquaMap Live World Radar & Minimap
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/80 text-cyan-300 font-mono border border-cyan-700/60 font-bold">
              Showcasing AquaMap
            </span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            60 FPS Dynamic Radar & World Coordinates Tracking
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Directly connected to <span className="text-cyan-300 font-bold">AquaMap</span> (authored by efekkoc). 
            Smooth hardware-accelerated canvas panning, interactive drag-to-navigate, and dimension telemetries.
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
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-[#060c16] overflow-hidden shadow-2xl relative">
          
          {/* Top Canvas Controls Bar */}
          <div className="p-4 bg-[#0a1220]/90 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10 relative">
            
            {/* Dimension Selector */}
            <div className="flex p-0.5 bg-[#0e1626] rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setWorld('world')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  world === 'world' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overworld
              </button>
              <button
                onClick={() => setWorld('world_nether')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  world === 'world_nether' ? 'bg-red-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                The Nether
              </button>
              <button
                onClick={() => setWorld('world_the_end')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  world === 'world_the_end' ? 'bg-purple-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                The End
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                serverStatus === 'ONLINE' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${serverStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                {serverStatus === 'ONLINE' ? 'Live Telemetry' : 'Standby Mode'}
              </span>
            </div>

            {/* Zoom & Recenter Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.3, 3.5))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1">{(zoom * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.4))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setCenterCoord({ x: 0, z: 0 }); setSelectedPlayer(null); }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-cyan-400 ml-1 cursor-pointer"
                title="Recenter at Spawn (0,0)"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 60 FPS HTML5 Canvas with smooth dragging */}
          <div className="relative h-[480px] w-full flex items-center justify-center select-none overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            />

            {/* Compass HUD Indicator (Top Right) */}
            <div className="absolute top-4 right-4 p-2.5 bg-black/70 backdrop-blur-md rounded-2xl border border-slate-800 text-center font-mono pointer-events-none shadow-lg">
              <span className="text-xs font-bold text-red-400 block">N</span>
              <div className="w-7 h-7 mx-auto my-0.5 border border-slate-700 rounded-full flex items-center justify-center">
                <Navigation className="w-4 h-4 text-cyan-400 rotate-45" />
              </div>
              <span className="text-[9px] text-slate-500 block">Compass</span>
            </div>

            {/* Bottom Coordinates & Navigation Tip */}
            <div className="absolute bottom-4 left-4 px-3.5 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none flex items-center gap-3 shadow-lg">
              <span>Center: <span className="text-cyan-300 font-bold">X: {centerCoord.x}</span>, <span className="text-cyan-300 font-bold">Z: {centerCoord.z}</span></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-[11px]">Click &amp; Drag to pan • Scroll to zoom</span>
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
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                serverStatus === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
              }`}>
                {serverStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Real player list when online, or clean state when server is offline */}
            {serverStatus !== 'ONLINE' || players.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-2.5 my-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500">
                  <PowerOff className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">0 Players Active</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Server is currently offline. Connected players will appear here in real-time when the server is launched.
                  </p>
                </div>
              </div>
            ) : (
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
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
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
            )}
          </div>

          {/* Quick Player Teleport / Ping Action */}
          <div className="p-3.5 bg-cyan-950/30 rounded-xl border border-cyan-900/40 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 block">AquaMap Radar Navigation</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Click &amp; drag directly on the radar to smoothly explore world coordinates, or click any active player to lock coordinates.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
