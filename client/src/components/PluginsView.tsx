import React, { useState, useEffect } from 'react';
import { Box, Github, ShoppingBag, Upload, Power, Trash2, Download, Check, Sparkles, ExternalLink, Search } from 'lucide-react';
import { PluginMeta, MarketplacePlugin, GitHubRepoRelease } from '../types';

interface PluginsViewProps {
  plugins: PluginMeta[];
  onTogglePlugin: (fileName: string) => void;
  onDeletePlugin: (fileName: string) => void;
  onUploadPlugin: (file: File) => void;
  onInstallMarketplacePlugin: (fileName: string, downloadUrl?: string) => Promise<void>;
}

export const PluginsView: React.FC<PluginsViewProps> = ({
  plugins,
  onTogglePlugin,
  onDeletePlugin,
  onUploadPlugin,
  onInstallMarketplacePlugin
}) => {
  const [subTab, setSubTab] = useState<'installed' | 'github' | 'modrinth'>('installed');
  const [aquaFishingReleases, setAquaFishingReleases] = useState<GitHubRepoRelease[]>([]);
  const [aquaMapReleases, setAquaMapReleases] = useState<GitHubRepoRelease[]>([]);
  const [marketplacePlugins, setMarketplacePlugins] = useState<MarketplacePlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [installingFile, setInstallingFile] = useState<string | null>(null);

  useEffect(() => {
    // Fetch GitHub releases for efekkoc repos
    fetch('/api/marketplace/github-releases/AquaFishing')
      .then(res => res.json())
      .then(data => setAquaFishingReleases(data.releases || []))
      .catch(() => {});

    fetch('/api/marketplace/github-releases/AquaMap')
      .then(res => res.json())
      .then(data => setAquaMapReleases(data.releases || []))
      .catch(() => {});

    // Fetch initial Modrinth popular plugins
    fetch('/api/marketplace/modrinth')
      .then(res => res.json())
      .then(data => setMarketplacePlugins(data.plugins || []))
      .catch(() => {});
  }, []);

  const handleSearchModrinth = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/marketplace/modrinth?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => setMarketplacePlugins(data.plugins || []))
      .catch(() => {});
  };

  const handleInstall = async (fileName: string, downloadUrl?: string) => {
    setInstallingFile(fileName);
    try {
      await onInstallMarketplacePlugin(fileName, downloadUrl);
    } finally {
      setInstallingFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadPlugin(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('installed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'installed'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            Installed Plugins ({plugins.length})
          </button>

          <button
            onClick={() => setSubTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'github'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-4 h-4 text-cyan-400" />
            efekkoc Repositories
          </button>

          <button
            onClick={() => setSubTab('modrinth')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'modrinth'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Modrinth Marketplace
          </button>
        </div>

        {subTab === 'installed' && (
          <label className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-all">
            <Upload className="w-3.5 h-3.5" />
            Upload .jar
            <input type="file" accept=".jar" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {/* 1. INSTALLED PLUGINS VIEW */}
      {subTab === 'installed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.fileName}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                plugin.enabled
                  ? 'bg-[#0e1524] border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                        plugin.enabled
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      JAR
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {plugin.name}
                        {plugin.name.includes('Aqua') && (
                          <span className="p-0.5 rounded bg-cyan-950 text-cyan-400" title="Authored by efekkoc">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">v{plugin.version} • API {plugin.apiVersion}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      plugin.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {plugin.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {plugin.description || 'No description provided in plugin.yml'}
                </p>

                {plugin.authors.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    Author: <span className="text-slate-300 font-medium">{plugin.authors.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500">
                  {(plugin.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePlugin(plugin.fileName)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      plugin.enabled
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title={plugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeletePlugin(plugin.fileName)}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-red-950/40 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                    title="Delete Plugin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. EFEKKOC GITHUB REPOSITORIES VIEW */}
      {subTab === 'github' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 border border-cyan-800/40 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Github className="w-4 h-4" />
                Live GitHub Releases Sync (github.com/efekkoc)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Direct integration with your repositories. Any release tagged on GitHub can be deployed straight to the test server with a single click.
              </p>
            </div>
            <a
              href="https://github.com/efekkoc"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 transition-all"
            >
              Visit Profile
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AquaFishing Card */}
            <div className="p-6 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Paper 1.21+ RPG
                  </span>
                  <h4 className="text-base font-bold text-slate-100 mt-2">AquaFishing</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    🎣 40 özel balık türü, 10 kademeli RPG oltası, sarma mini-oyunu ve turnuva sistemi sunan gelişmiş balıkçılık eklentisi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Latest Release:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {aquaFishingReleases[0]?.releaseTag || 'v1.0.0-RELEASE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {aquaFishingReleases[0]?.body || 'Paper 1.21.4 compatibility, custom model data rods, and reeling mechanics.'}
                </p>
              </div>

              <button
                onClick={() => handleInstall('AquaFishing-1.0.0.jar')}
                disabled={installingFile === 'AquaFishing-1.0.0.jar'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {installingFile === 'AquaFishing-1.0.0.jar' ? (
                  'Deploying to plugins/...'
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Deploy Latest Release to Server
                  </>
                )}
              </button>
            </div>

            {/* AquaMap Card */}
            <div className="p-6 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Clientless Live Radar
                  </span>
                  <h4 className="text-base font-bold text-slate-100 mt-2">AquaMap</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Paper 1.21.x için modsuz, istemci kurulum gerektirmeyen canlı mini harita, oyuncu radarı ve HUD pusula eklentisi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Latest Release:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {aquaMapReleases[0]?.releaseTag || 'v1.2.0-RELEASE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {aquaMapReleases[0]?.body || 'Async compass HUD, tick-perfect packet streaming without client mods.'}
                </p>
              </div>

              <button
                onClick={() => handleInstall('AquaMap-1.2.0.jar')}
                disabled={installingFile === 'AquaMap-1.2.0.jar'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {installingFile === 'AquaMap-1.2.0.jar' ? (
                  'Deploying to plugins/...'
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Deploy Latest Release to Server
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODRINTH MARKETPLACE VIEW */}
      {subTab === 'modrinth' && (
        <div className="space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearchModrinth} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Modrinth for Paper 1.21 plugins (e.g. spark, WorldEdit, LuckPerms)..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0e1524] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-all"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplacePlugins.map((item) => {
              const isInstalled = plugins.some(p => p.name.toLowerCase() === item.title.toLowerCase() || p.fileName.toLowerCase().includes(item.slug));

              return (
                <div
                  key={item.id}
                  className="p-5 bg-[#0e1524] rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.title} className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                            P
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">by {item.author}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {item.downloads.toLocaleString()} dl
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400">Paper 1.21</span>

                    {isInstalled ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40">
                        <Check className="w-3 h-3" />
                        INSTALLED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstall(item.versions[0]?.fileName || `${item.slug}.jar`, item.versions[0]?.downloadUrl)}
                        disabled={installingFile === item.versions[0]?.fileName}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {installingFile === item.versions[0]?.fileName ? 'Installing...' : '1-Click Install'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
