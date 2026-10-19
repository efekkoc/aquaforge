import React, { useState } from 'react';
import { 
  Wand2, X, Check, Server, Shield, Zap, Coins, Box, Compass, 
  Swords, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Layers,
  Lock, Eye, MessageSquare, Award, MapPin, TrendingUp, Fish
} from 'lucide-react';
import { ALL_AQUA_PLUGINS } from './AquaSuiteHubView';

interface ServerWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteLaunch: (config: {
    serverName: string;
    archetype: string;
    version: string;
    ramGB: number;
    selectedPlugins: string[];
  }) => void;
}

export const ServerWizardModal: React.FC<ServerWizardModalProps> = ({
  isOpen,
  onClose,
  onCompleteLaunch
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [serverName, setServerName] = useState('AquaSMP Network');
  const [archetype, setArchetype] = useState('smp');
  const [selectedVersion, setSelectedVersion] = useState('1.21.11 – Mounts of Mayhem (Recommended)');
  const [ramGB, setRamGB] = useState(8);
  const [eulaAccepted, setEulaAccepted] = useState(true);

  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([
    'aquamap', 'aquaclaims', 'aquachat', 'aquaeconomy', 'aquaskills', 'aquapass', 'aquarunes', 'aquafishing', 'aquacrates'
  ]);

  if (!isOpen) return null;

  const handleArchetypeSelect = (archId: string) => {
    setArchetype(archId);
    if (archId === 'smp') {
      setSelectedPlugins(['aquamap', 'aquaclaims', 'aquachat', 'aquaeconomy', 'aquamarket', 'aquawarps', 'aquaskills', 'aquapass', 'aquaenchants', 'aquascoreboard', 'aquaranks', 'aquacombat', 'aquabounties', 'aquacrates']);
    } else if (archId === 'security') {
      setSelectedPlugins(['aquasecurity', 'aquawatchdog', 'aquastaff', 'aquacombat', 'aquaranks', 'aquachat', 'aquaeconomy']);
    } else if (archId === 'rpg') {
      setSelectedPlugins(['aquadungeons', 'aquaskills', 'aquaenchants', 'aquapass', 'aquarunes', 'aquacrates', 'aquamarket', 'aquamap', 'aquafishing', 'aquascoreboard']);
    } else if (archId === 'all') {
      setSelectedPlugins(ALL_AQUA_PLUGINS.map(p => p.id));
    }
  };

  const togglePlugin = (id: string) => {
    if (selectedPlugins.includes(id)) {
      setSelectedPlugins(selectedPlugins.filter(p => p !== id));
    } else {
      setSelectedPlugins([...selectedPlugins, id]);
    }
  };

  const handleFinalLaunch = () => {
    onCompleteLaunch({
      serverName,
      archetype,
      version: selectedVersion,
      ramGB,
      selectedPlugins
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#0b1320] border border-cyan-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                1-Click Server Wizard
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Global Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">Launch a production-grade Minecraft server in 30 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Tabs */}
        <div className="px-8 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</span>
            Server Preset
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</span>
            Engine & Version
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</span>
            Aqua Plugins ({selectedPlugins.length})
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-2 ${step === 4 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>4</span>
            Final Launch
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Choose Your Server Archetype</h3>
              <p className="text-xs text-slate-400">Select what kind of Minecraft server you want to launch. Plugins and optimal configs will be pre-configured automatically.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { id: 'smp', title: '⚔️ Competitive Survival & SMP', desc: 'Public survival with land claims, economy, auction house, custom chat, RPG skills, and battle pass.', badge: 'MOST POPULAR' },
                  { id: 'security', title: '🛡️ Hardcore Secure Network', desc: 'Zero-trust network with 2FA TOTP Google Authenticator, raycast anti-cheat, combat tag, and staff vanish.', badge: 'HIGH SECURITY' },
                  { id: 'rpg', title: '🏰 MMO Dungeons & Adventure', desc: 'Procedural mob arenas, custom enchants, weapon runes, RPG fishing mini-game, and tiered crates.', badge: 'RPG ENGINE' },
                  { id: 'all', title: '🌟 Ultimate Complete Suite', desc: 'Deploys all 20 standalone Aqua plugins authored by efekkoc with 100% native compatibility.', badge: 'ALL 20 PLUGINS' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleArchetypeSelect(item.id)}
                    className={`p-5 rounded-2xl border transition cursor-pointer select-none ${
                      archetype === item.id
                        ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Select Minecraft Version & Server Engine</h3>
              <p className="text-xs text-slate-400">All Aqua plugins support Paper 1.20.x through 1.21.11 natively with modern Data Components.</p>

              <div className="space-y-3 pt-2">
                {[
                  { id: '1.21.11 – Mounts of Mayhem (Recommended)', engine: 'Paper 1.21.11', note: 'Largest active modern player base. Nautilus Mounts & Spears fully supported.' },
                  { id: '1.21.4 – The Garden Awakens', engine: 'Paper 1.21.4', note: 'Pale Garden & Creaking biome drop engine.' },
                  { id: '1.21.1 – Tricky Trials (LTS)', engine: 'Paper 1.21.1', note: 'Long-term stable release with maximum third-party mod bridge support.' },
                  { id: '1.21.1 – Purpur Fork', engine: 'Purpur 1.21.1', note: 'Extreme performance fork with customizable creature AI and redstone tweaks.' }
                ].map((ver) => (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      selectedVersion === ver.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{ver.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {ver.engine}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{ver.note}</p>
                    </div>
                    {selectedVersion === ver.id && <Check className="w-5 h-5 text-cyan-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Customize Aqua Flagship Plugins</h3>
                  <p className="text-xs text-slate-400">Toggle individual plugins on or off. Zero external dependencies required.</p>
                </div>
                <button
                  onClick={() => setSelectedPlugins(ALL_AQUA_PLUGINS.map(p => p.id))}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                >
                  Select All ({ALL_AQUA_PLUGINS.length})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {ALL_AQUA_PLUGINS.map((plugin) => {
                  const isChecked = selectedPlugins.includes(plugin.id);
                  const Icon = plugin.icon;
                  return (
                    <div
                      key={plugin.id}
                      onClick={() => togglePlugin(plugin.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-900/90 border-cyan-600/80 shadow-md'
                          : 'bg-slate-900/30 border-slate-800/80 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${plugin.color} flex items-center justify-center text-white flex-shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{plugin.name}</h4>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{plugin.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Final Server Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Server Network Name
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-cyan-500 outline-none"
                    placeholder="My Minecraft Server"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    RAM Allocation: <span className="text-cyan-400 font-mono text-sm">{ramGB} GB</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="32"
                    step="2"
                    value={ramGB}
                    onChange={(e) => setRamGB(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>2 GB (Testing)</span>
                    <span>8 GB (Recommended)</span>
                    <span>16 GB (Heavy SMP)</span>
                    <span>32 GB (Network)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Agree to Mojang EULA</p>
                      <p className="text-[11px] text-slate-400">Automatically creates eula.txt with eula=true</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={eulaAccepted}
                    onChange={(e) => setEulaAccepted(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-8 py-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-900/40"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalLaunch}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center gap-2.5 transition cursor-pointer shadow-xl shadow-teal-900/40"
            >
              <Sparkles className="w-4 h-4" />
              ⚡ Launch Server Instantly
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
