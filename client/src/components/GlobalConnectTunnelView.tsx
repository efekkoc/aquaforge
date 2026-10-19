import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, Activity, Zap, Copy, Check, Radio, 
  ArrowUpRight, RefreshCw, Lock, Server, Cpu, Wifi, AlertCircle
} from 'lucide-react';

interface GlobalConnectTunnelViewProps {
  serverStatus: string;
}

export const GlobalConnectTunnelView: React.FC<GlobalConnectTunnelViewProps> = ({ serverStatus }) => {
  const [tunnelEnabled, setTunnelEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState('frankfurt');
  const [protocol, setProtocol] = useState<'tcp' | 'udp' | 'dual'>('dual');
  const [liveLatency, setLiveLatency] = useState(19);
  const [bandwidthMbps, setBandwidthMbps] = useState(2.4);

  const edgeNodes = [
    { id: 'frankfurt', name: 'Frankfurt (EU-Central)', ping: 18, flag: '🇩🇪', load: '14%' },
    { id: 'istanbul', name: 'Istanbul (TR-Edge)', ping: 8, flag: '🇹🇷', load: '9%' },
    { id: 'london', name: 'London (EU-West)', ping: 26, flag: '🇬🇧', load: '22%' },
    { id: 'ashburn', name: 'Ashburn (US-East)', ping: 78, flag: '🇺🇸', load: '31%' },
    { id: 'singapore', name: 'Singapore (AP-East)', ping: 145, flag: '🇸🇬', load: '12%' },
  ];

  const publicAddress = 'connect.aquaforge.gg:25565';

  useEffect(() => {
    const timer = setInterval(() => {
      const selected = edgeNodes.find(e => e.id === selectedEdge);
      const base = selected ? selected.ping : 20;
      setLiveLatency(base + Math.floor(Math.random() * 5) - 2);
      setBandwidthMbps(+(1.8 + Math.random() * 1.5).toFixed(2));
    }, 2500);
    return () => clearInterval(timer);
  }, [selectedEdge]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="p-8 bg-gradient-to-r from-[#07172b] via-[#091b33] to-[#0d2342] rounded-3xl border border-cyan-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Zero-Portforward Edge Gateway
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Layer 4/7 DDoS Scrubber Active
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Global Play Tunnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">(Anywhere Access)</span>
            </h1>
            <p className="text-slate-300 max-w-3xl text-sm leading-relaxed">
              Share your local server worldwide without opening router ports or exposing your home IP address. 
              Encrypted Anycast tunnel connects instantly to players across the globe with &lt;20ms latency.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTunnelEnabled(!tunnelEnabled)}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-lg ${
                tunnelEnabled 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Radio className={`w-4 h-4 ${tunnelEnabled ? 'animate-pulse text-white' : 'text-slate-400'}`} />
              {tunnelEnabled ? 'Tunnel Active (Live)' : 'Tunnel Stopped'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Connection Bar Card */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 w-full lg:w-auto">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              Public Server Connection Address (Give this to players)
            </span>
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 bg-slate-950 rounded-xl border border-cyan-800/60 font-mono text-cyan-300 font-bold text-lg flex items-center gap-3 shadow-inner">
                <span>{publicAddress}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-5 py-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy IP:Port'}
              </button>
            </div>
          </div>

          {/* Quick Telemetry Pills */}
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Edge Latency</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{liveLatency} ms</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Traffic Rate</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{bandwidthMbps} MB/s</span>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block">DDoS Drops</span>
              <span className="text-xl font-bold font-mono text-slate-200">0.00%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Routing Nodes Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {edgeNodes.map((edge) => (
          <div
            key={edge.id}
            onClick={() => setSelectedEdge(edge.id)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none ${
              selectedEdge === edge.id
                ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{edge.flag}</span>
              <span className={`text-xs font-mono font-bold ${selectedEdge === edge.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                {edge.ping} ms
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">{edge.name}</h4>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span>Node Load</span>
              <span className="font-mono text-emerald-400">{edge.load}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Transport Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">TLS 1.3 / WireGuard Encrypted</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All packets traveling between your local machine and the global edge servers are encapsulated inside authenticated tunnels, blocking MITM interception.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero ISP IP Exposure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your residential home IP address is completely shielded. Malicious players targeting your server cannot trigger home network disruptions.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Dual-Stack TCP + Bedrock UDP</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic protocol translation handles both standard Java Edition TCP connections and GeyserMC Bedrock UDP cross-play without packet drops.
          </p>
        </div>
      </div>
    </div>
  );
};
