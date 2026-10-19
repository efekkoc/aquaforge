import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Download, RefreshCw, 
  Layers, Sparkles, Box, ExternalLink, ShieldAlert
} from 'lucide-react';
import { DependencyCheckResult, PluginMeta } from '../types';

interface DependencyMatrixViewProps {
  plugins: PluginMeta[];
  showToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
  onRefreshPlugins: () => void;
}

export const DependencyMatrixView: React.FC<DependencyMatrixViewProps> = ({ 
  plugins, 
  showToast,
  onRefreshPlugins
}) => {
  const [analysis, setAnalysis] = useState<{
    totalChecked: number;
    missingRequired: DependencyCheckResult[];
    missingOptional: DependencyCheckResult[];
    allSatisfied: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [resolvingDep, setResolvingDep] = useState<string | null>(null);

  const runAnalysis = () => {
    setLoading(true);
    fetch('/api/plugins/dependencies')
      .then(r => r.json())
      .then(d => {
        setAnalysis(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    runAnalysis();
  }, [plugins]);

  const handleResolve = (dep: DependencyCheckResult) => {
    setResolvingDep(dep.requiredDependency);
    fetch('/api/marketplace/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: dep.suggestedJar || `${dep.requiredDependency}.jar`,
        downloadUrl: `https://api.modrinth.com/v2/project/${dep.downloadSlug || dep.requiredDependency.toLowerCase()}`
      })
    })
      .then(r => r.json())
      .then(d => {
        setResolvingDep(null);
        showToast(d.message || `Resolved dependency: ${dep.requiredDependency}`, 'success');
        onRefreshPlugins();
        runAnalysis();
      })
      .catch(() => {
        setResolvingDep(null);
        showToast(`Failed to auto-resolve ${dep.requiredDependency}`, 'error');
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Plugin Dependency & Conflict Matrix
          </div>
          <h3 className="text-lg font-black text-white">
            Automated Cross-Plugin Verification Engine
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Scans <code className="text-cyan-300 font-mono">plugin.yml</code> manifests before server boot. 
            Detects missing core libraries (Vault, ProtocolLib, LuckPerms) to prevent startup crash loops.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          Re-Scan Plugins
        </button>
      </div>

      {/* Status Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0b101c] rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Plugins Inspected</span>
            <span className="text-xl font-bold font-mono text-white">{plugins.length}</span>
          </div>
        </div>

        <div className="p-4 bg-[#0b101c] rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${
            analysis?.missingRequired.length === 0 
              ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' 
              : 'bg-red-950/60 border-red-800/40 text-red-400'
          }`}>
            {analysis?.missingRequired.length === 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Missing Hard Dependencies</span>
            <span className={`text-xl font-bold font-mono ${
              analysis?.missingRequired.length === 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {analysis?.missingRequired.length || 0}
            </span>
          </div>
        </div>

        <div className="p-4 bg-[#0b101c] rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Soft Dependencies</span>
            <span className="text-xl font-bold font-mono text-amber-300">{analysis?.missingOptional.length || 0} Optional</span>
          </div>
        </div>
      </div>

      {/* Missing Required Alert Section */}
      {analysis && analysis.missingRequired.length > 0 && (
        <div className="p-5 bg-red-950/20 border border-red-500/40 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            Action Required: Missing Hard Dependencies Detected
          </div>
          <p className="text-xs text-slate-300">
            The following plugins will fail to enable on server startup because their required companion libraries are not installed in <code className="text-cyan-300 font-mono">server/plugins/</code>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {analysis.missingRequired.map(dep => (
              <div 
                key={`${dep.pluginName}-${dep.requiredDependency}`}
                className="p-4 bg-slate-900/90 rounded-xl border border-red-900/60 flex items-center justify-between gap-3 shadow-md"
              >
                <div>
                  <span className="font-bold text-xs text-white block">
                    {dep.pluginName} requires <span className="text-red-400 font-bold font-mono">{dep.requiredDependency}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Suggested file: {dep.suggestedJar}
                  </span>
                </div>

                <button
                  onClick={() => handleResolve(dep)}
                  disabled={resolvingDep === dep.requiredDependency}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  {resolvingDep === dep.requiredDependency ? 'Resolving...' : 'Auto-Install'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Dependencies Satisfied State */}
      {analysis && analysis.missingRequired.length === 0 && (
        <div className="p-8 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-900/40 border border-emerald-600/40 rounded-full text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">All Plugin Dependencies Satisfied</h4>
            <p className="text-xs text-slate-300">
              Your server plugins tree is completely coherent. No missing libraries or conflicting dependencies detected.
            </p>
          </div>
        </div>
      )}

      {/* Installed Plugins Matrix Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-200">Plugin Manifest Dependency Graph</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map(p => (
            <div key={p.fileName} className="p-4 bg-[#0b101c] rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{p.name}</span>
                <span className="text-[10px] font-mono text-cyan-400">{p.version}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono">Requires: </span>
                  {p.depends && p.depends.length > 0 ? (
                    <span className="text-slate-300 font-mono">{p.depends.join(', ')}</span>
                  ) : (
                    <span className="text-slate-600 italic">None (Standalone)</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono">Soft-Depends: </span>
                  {p.softDepends && p.softDepends.length > 0 ? (
                    <span className="text-slate-400 font-mono">{p.softDepends.join(', ')}</span>
                  ) : (
                    <span className="text-slate-600 italic">None</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
