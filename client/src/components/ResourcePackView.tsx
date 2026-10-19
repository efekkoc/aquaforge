import React, { useState, useEffect } from 'react';
import { PackageOpen, Upload, Check, Hash, Copy, Server, CheckCircle2, FileArchive } from 'lucide-react';
import { ResourcePackItem } from '../types';

export const ResourcePackView: React.FC = () => {
  const [packs, setPacks] = useState<ResourcePackItem[]>([]);
  const [currentApplied, setCurrentApplied] = useState<{ url: string; sha1: string } | null>(null);
  const [copiedSha1, setCopiedSha1] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPacks = () => {
    fetch('/api/resourcepacks')
      .then(r => r.json())
      .then(d => {
        setPacks(d.packs || []);
        setCurrentApplied(d.current || null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleApply = (fileName: string) => {
    fetch('/api/resourcepacks/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName })
    })
      .then(r => r.json())
      .then(d => {
        setActionMessage(d.message);
        fetchPacks();
        setTimeout(() => setActionMessage(null), 4000);
      });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('pack', file);

    fetch('/api/resourcepacks/upload', {
      method: 'POST',
      body: formData
    })
      .then(r => r.json())
      .then(() => fetchPacks());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSha1(text);
    setTimeout(() => setCopiedSha1(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0c1828] to-[#121f33] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <PackageOpen className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">Resource Pack CDN & SHA-1 Sync</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Essential for custom RPG plugins like <span className="text-cyan-300 font-semibold">AquaFishing</span>. Generates byte-accurate SHA-1 cryptographic hashes and automatically configures <code className="text-cyan-300 font-mono">server.properties</code> so players prompt-download textures upon joining.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-cyan-600/20 transition-all self-start md:self-auto">
          <Upload className="w-3.5 h-3.5" />
          Upload Pack (.zip)
          <input type="file" accept=".zip" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Current Active Pack Card */}
      <div className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          Active server.properties Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-1">resource-pack URL:</span>
            <span className="text-cyan-400 truncate block">
              {currentApplied?.url || '(None configured)'}
            </span>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-1">resource-pack-sha1:</span>
            <span className="text-emerald-400 truncate block">
              {currentApplied?.sha1 || '(None configured)'}
            </span>
          </div>
        </div>
      </div>

      {/* Pack List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Available Resource Packs ({packs.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                pack.isApplied
                  ? 'bg-cyan-950/20 border-cyan-700/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'bg-[#0e1524] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                      <FileArchive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{pack.fileName}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {(pack.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {new Date(pack.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {pack.isApplied && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      ACTIVE PACK
                    </span>
                  )}
                </div>

                {/* SHA1 Chip */}
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Hash className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 truncate select-all">{pack.sha1}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pack.sha1)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 transition-all cursor-pointer flex-shrink-0 ml-2"
                    title="Copy SHA-1 Checksum"
                  >
                    {copiedSha1 === pack.sha1 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Auto-hosted CDN Endpoint</span>

                <button
                  onClick={() => handleApply(pack.fileName)}
                  disabled={pack.isApplied}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pack.isApplied
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                  }`}
                >
                  {pack.isApplied ? 'Currently Synced' : '1-Click Apply to Server'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
