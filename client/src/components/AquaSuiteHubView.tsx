import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Shield, Zap, Coins, Box, Compass, 
  Fish, Swords, Lock, Eye, Download, Check, ExternalLink, Server, Layers,
  MessageSquare, Award, MapPin, TrendingUp, ShoppingCart, Navigation, Target,
  BarChart3, Crown, Flame, Pickaxe, Landmark, Trees, KeyRound, PartyPopper
} from 'lucide-react';

export interface SuitePlugin {
  id: string;
  name: string;
  category: 'Security & Auth' | 'Economy' | 'Combat & RPG' | 'Anti-Cheat' | 'Utility & Radar' | 'Moderation' | 'Loot & Rewards' | 'MMO Arena' | 'Chat & Social' | 'World Protection' | 'Progression' | 'Teleport & Spawn' | 'Enchantments' | 'Interface & Tab' | 'Ranks & Perms' | 'PvP Combat';
  icon: any;
  color: string;
  version: string;
  description: string;
  githubUrl: string;
  features: string[];
}

export const ALL_AQUA_PLUGINS: SuitePlugin[] = [
  {
    id: 'aquamap',
    name: 'AquaMap',
    category: 'Utility & Radar',
    icon: Compass,
    color: 'from-cyan-500 to-blue-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Clientless 60 FPS live canvas minimap, player radar, waypoints & HUD compass engine for Paper.',
    githubUrl: 'https://github.com/efekkoc/AquaMap',
    features: ['Hardware-accelerated 60 FPS Canvas', 'Interactive double-click waypoints', 'North alignment compass HUD', 'Multi-dimension Overworld/Nether/End']
  },
  {
    id: 'aquasecurity',
    name: 'AquaSecurity',
    category: 'Security & Auth',
    icon: Lock,
    color: 'from-emerald-500 to-teal-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise 2FA TOTP (Google Authenticator) & total session lockdown guard for server staff.',
    githubUrl: 'https://github.com/efekkoc/AquaSecurity',
    features: ['RFC 6238 TOTP Google Authenticator', 'Strict freeze lockdown on login', '24h trusted IP session caching', 'Admin emergency secret reset']
  },
  {
    id: 'aquarunes',
    name: 'AquaRunes',
    category: 'Combat & RPG',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Modern 1.21.x Data Components & PDC weapon and armor rune engine with drag-and-drop socketing.',
    githubUrl: 'https://github.com/efekkoc/AquaRunes',
    features: ['6 Legendary Runes (Vampire, Tempest, Gale, etc.)', 'Drag & drop inventory socketing', 'Ambient rotating particle aura rings', 'Custom Data Components & Lore']
  },
  {
    id: 'aquawatchdog',
    name: 'AquaWatchdog',
    category: 'Anti-Cheat',
    icon: Eye,
    color: 'from-red-500 to-orange-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Real-time sliding CPS & raycast reach anti-cheat telemetry with Discord webhook triage.',
    githubUrl: 'https://github.com/efekkoc/AquaWatchdog',
    features: ['Raycast vector reach detection (>3.05 blocks)', '1000ms sliding window CPS & macro detection', 'Async Discord & AquaForge webhook alerts', 'In-game staff alerts & latency logging']
  },
  {
    id: 'aquaeconomy',
    name: 'AquaEconomy',
    category: 'Economy',
    icon: Coins,
    color: 'from-amber-500 to-yellow-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise high-performance banking & economy engine with Vault API provider and peer transfers.',
    githubUrl: 'https://github.com/efekkoc/AquaEconomy',
    features: ['Zero-lag in-memory transaction engine', 'Dual-layer Wallet + Bank with interest', 'Instant peer-to-peer /pay transfers', 'Vault API compatible provider']
  },
  {
    id: 'aquacrates',
    name: 'AquaCrates',
    category: 'Loot & Rewards',
    icon: Box,
    color: 'from-fuchsia-500 to-rose-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: '3D particle animated loot crate & reward matrix with pitch escalations and firework climaxes.',
    githubUrl: 'https://github.com/efekkoc/AquaCrates',
    features: ['3D spiral particle unboxing animation', 'Firework victory celebration', '1.21.1/1.21.4/1.21.11 item lore support', 'Pity system guaranteed rewards']
  },
  {
    id: 'aquastaff',
    name: 'AquaStaff',
    category: 'Moderation',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Unified staff mode with silent vanish, suspect freeze lockdown, and live inventory inspection.',
    githubUrl: 'https://github.com/efekkoc/AquaStaff',
    features: ['1-Click flight & staff mode (/staff)', 'Silent vanish invisibility (/v)', 'Suspect freeze lockdown (/freeze)', 'Live target inventory view (/invsee)']
  },
  {
    id: 'aquadungeons',
    name: 'AquaDungeons',
    category: 'MMO Arena',
    icon: Swords,
    color: 'from-orange-500 to-red-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Procedural wave-based mob arena and boss fight engine with dynamic multi-phase BossBars.',
    githubUrl: 'https://github.com/efekkoc/AquaDungeons',
    features: ['Multi-wave mob arenas with scaling HP', 'Dynamic colored BossBar tracking', 'Raid party queue management', 'Wave completion reward tables']
  },
  {
    id: 'aquaclaims',
    name: 'AquaClaims',
    category: 'World Protection',
    icon: MapPin,
    color: 'from-emerald-600 to-green-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Chunk-based land claiming with interactive particle borders and trust access delegation.',
    githubUrl: 'https://github.com/efekkoc/AquaClaims',
    features: ['Chunk coordinate hashing claim engine', 'Glowing particle boundary visualizer', 'Co-op friend trust delegation (/trust)', 'Zero external grief prevention dependency']
  },
  {
    id: 'aquaskills',
    name: 'AquaSkills',
    category: 'Progression',
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'MMORPG character leveling, attribute stat boosts, and real-time action bar XP telemetry.',
    githubUrl: 'https://github.com/efekkoc/AquaSkills',
    features: ['5 Core Skills (Mining, Woodcutting, Combat, Farming, Agility)', 'Passive stat buffs (Bonus Hearts, Crit, Speed)', 'Real-time Action Bar XP animations', 'Level-up sound and firework celebration']
  },
  {
    id: 'aquachat',
    name: 'AquaChat',
    category: 'Chat & Social',
    icon: MessageSquare,
    color: 'from-sky-500 to-blue-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'RGB MiniMessage gradient chat, multi-channel broadcast, mention pings & held item showcase.',
    githubUrl: 'https://github.com/efekkoc/AquaChat',
    features: ['Kyori Adventure native hex & gradient colors', 'Multi-channel routing (Global, Local radius, Staff)', 'Item showcase command (/item)', 'Anti-spam rate limit protection']
  },
  {
    id: 'aquapass',
    name: 'AquaPass',
    category: 'Loot & Rewards',
    icon: Award,
    color: 'from-amber-400 to-orange-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Seasonal Battle Pass engine with Free & Premium tracks, daily quests, and 54-slot virtual GUI.',
    githubUrl: 'https://github.com/efekkoc/AquaPass',
    features: ['Dual-track 50-tier reward progression', 'Interactive 54-slot GUI menu (/pass)', 'Automated quest objectives (Mining, Mob Slayer)', 'Admin command injection tooling']
  },
  {
    id: 'aquafishing',
    name: 'AquaFishing',
    category: 'Combat & RPG',
    icon: Fish,
    color: 'from-teal-500 to-cyan-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Advanced RPG fishing engine with 40 custom fish, reeling mini-game, 10 rod tiers & bossbars.',
    githubUrl: 'https://github.com/efekkoc/AquaFishing',
    features: ['Interactive timing & reeling mini-game', '40 custom fish species & rarity tiers', '10 RPG fishing rod upgrades', 'ResourcePack CDN custom models']
  },
  {
    id: 'aquamarket',
    name: 'AquaMarket',
    category: 'Economy',
    icon: ShoppingCart,
    color: 'from-amber-400 to-emerald-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'High-performance global auction house, player market listings & return mailbox engine.',
    githubUrl: 'https://github.com/efekkoc/AquaMarket',
    features: ['54-slot interactive virtual auction GUI', '1.21 Data Components weapon support', 'Player item return mailbox (/ah mailbox)', 'Sales tax and deflationary currency sink']
  },
  {
    id: 'aquawarps',
    name: 'AquaWarps',
    category: 'Teleport & Spawn',
    icon: Navigation,
    color: 'from-blue-500 to-cyan-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Spawn, personal homes, public warps, peer TPA & intelligent raycast safe-wilderness RTP.',
    githubUrl: 'https://github.com/efekkoc/AquaWarps',
    features: ['Safe-RTP raycast block scanner', '3-second PvP anti-combat teleport warmup', 'Multi-home management (/home)', 'Async chunk pre-loading engine']
  },
  {
    id: 'aquabounties',
    name: 'AquaBounties',
    category: 'Loot & Rewards',
    icon: Target,
    color: 'from-red-500 to-rose-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Player head bounties, dynamic hunter tracking compass & PvP rivalry leaderboards.',
    githubUrl: 'https://github.com/efekkoc/AquaBounties',
    features: ['Place cash bounties on players (/bounty)', 'Hunter tracking compass locks target location', 'Trophy victim skull decapitation on kill', 'Global server announcement broadcast']
  },
  {
    id: 'aquaenchants',
    name: 'AquaEnchants',
    category: 'Enchantments',
    icon: Pickaxe,
    color: 'from-violet-500 to-fuchsia-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Modern 1.21.x custom enchantments with VeinMiner, Timber, Auto-Smelt and Telepathy.',
    githubUrl: 'https://github.com/efekkoc/AquaEnchants',
    features: ['VeinMiner cluster ore mining (Shift+Mine)', 'Timber whole-tree logging mechanics', 'Auto-Smelt raw ores directly into ingots', 'Telepathy item delivery to inventory']
  },
  {
    id: 'aquascoreboard',
    name: 'AquaScoreboard',
    category: 'Interface & Tab',
    icon: BarChart3,
    color: 'from-sky-400 to-indigo-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Flicker-free RGB sidebar scoreboard & modern Tablist header/footer engine with MiniMessage.',
    githubUrl: 'https://github.com/efekkoc/AquaScoreboard',
    features: ['Flicker-free team packet buffering', 'Kyori Adventure gradient & hex titles', 'Modern tablist header & footer with ping meters', 'Per-player visibility toggle (/sb)']
  },
  {
    id: 'aquaranks',
    name: 'AquaRanks',
    category: 'Ranks & Perms',
    icon: Crown,
    color: 'from-yellow-400 to-amber-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Lightweight in-memory rank management, overhead name tags, and permission cascades.',
    githubUrl: 'https://github.com/efekkoc/AquaRanks',
    features: ['Zero-SQL lightweight in-memory ranks', 'MiniMessage gradient overhead nametags', 'Fast administrative rank assignment (/rank set)', 'Priority based inheritance cascading']
  },
  {
    id: 'aquacombat',
    name: 'AquaCombat',
    category: 'PvP Combat',
    icon: Flame,
    color: 'from-red-600 to-orange-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Anti-CombatLog engine with notched BossBar timer, command blocking, and inventory drops on quit.',
    githubUrl: 'https://github.com/efekkoc/AquaCombat',
    features: ['Instantly slays players who combat-log', 'Dynamic 15-second notched BossBar countdown', 'Blocks escape commands (/spawn, /home, /tpa)', 'Smooth visual and sound transitions']
  },
  {
    id: 'aquanations',
    name: 'AquaNations',
    category: 'World Protection',
    icon: Landmark,
    color: 'from-emerald-400 to-teal-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise civilizations, towns, nations & 3D Display Entity monuments engine.',
    githubUrl: 'https://github.com/efekkoc/AquaNations',
    features: ['Towns & empires with daily upkeep taxes', '1.21 Display Entity 3D animated civilization monuments', 'Smart plot zoning (Residential, Commercial, Arena, Embassy)', 'Siege war declarations with notched BossBar capture timers']
  },
  {
    id: 'aquasurvival',
    name: 'AquaSurvival',
    category: 'Progression',
    icon: Trees,
    color: 'from-green-500 to-emerald-700',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise survival & SMP mechanics (1.21 Display graves, dynamic sleep vote, silk spawners & elevators).',
    githubUrl: 'https://github.com/efekkoc/AquaSurvival',
    features: ['1.21 Display Entity gravestones with Soul Recovery Compass', 'Multiplayer sleep vote with real-time BossBar countdown', 'Silk Touch spawner harvesting with PDC mob memory', 'Fast leaf decay & vertical wool elevators']
  },
  {
    id: 'aquaauth',
    name: 'AquaAuth',
    category: 'Security & Auth',
    icon: KeyRound,
    color: 'from-amber-500 to-red-600',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise player authentication, password confirmation & session lockdown gatekeeper.',
    githubUrl: 'https://github.com/efekkoc/AquaAuth',
    features: ['Password registration with confirmation (/register <pass> <passAgain>)', 'Salted SHA-256 key-stretched cryptographic hashing', 'Pre-login complete movement, chat & damage lockdown', '30-minute verified IP session auto-login cache']
  },
  {
    id: 'aquaevents',
    name: 'AquaEvents',
    category: 'Loot & Rewards',
    icon: PartyPopper,
    color: 'from-amber-400 to-rose-500',
    version: '1.20.x – 1.21.11 (Universal)',
    description: 'Enterprise automated survival events, 1.21 Display wilderness supply drops & chat trivia engine.',
    githubUrl: 'https://github.com/efekkoc/AquaEvents',
    features: ['1.21 Display Entity parachuting supply crates with beacon flares', 'Server-wide boosters: Mining Rush (2x Ores), Double XP, Blood Moon', 'Chat reaction & trivia quizzes with instant cash prizes', 'Automatic 45-minute rotating survival event scheduler']
  }
];

export const PRESET_BUNDLES = [
  {
    id: 'ultimate',
    name: '🌟 Ultimate Complete Suite',
    badge: 'ALL-IN-ONE (24 PLUGINS)',
    description: 'Deploy all 24 Aqua flagship plugins simultaneously. 100% self-sufficient server network covering automated events, authentication, towns, survival graves, security, economy, combat, claims, chat, pass, skills, market, warps, enchants, scoreboard, ranks, and radar.',
    pluginIds: [
      'aquaevents', 'aquaauth', 'aquamap', 'aquasecurity', 'aquarunes', 'aquawatchdog', 'aquaeconomy', 
      'aquacrates', 'aquastaff', 'aquadungeons', 'aquaclaims', 'aquaskills', 
      'aquachat', 'aquapass', 'aquafishing', 'aquamarket', 'aquawarps', 
      'aquabounties', 'aquaenchants', 'aquascoreboard', 'aquaranks', 'aquacombat',
      'aquanations', 'aquasurvival'
    ],
    tagColor: 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
  },
  {
    id: 'survival_smp',
    name: '⚔️ Complete Survival, SMP & Nations Package',
    badge: 'SURVIVAL PACKAGE',
    description: 'The turnkey bundle for survival & SMP servers: survival events, airdrops, login authentication, 3D Display graves, sleep vote, silk spawners, elevators, nations/towns, claims, chat, economy, market, warps, enchants, ranks, scoreboard, and combat log prevention.',
    pluginIds: [
      'aquaevents', 'aquaauth', 'aquasurvival', 'aquanations', 'aquamap', 'aquaclaims', 'aquachat', 'aquaeconomy', 'aquamarket', 
      'aquawarps', 'aquaskills', 'aquapass', 'aquaenchants', 'aquascoreboard', 
      'aquaranks', 'aquacombat', 'aquabounties', 'aquacrates'
    ],
    tagColor: 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
  },
  {
    id: 'hardcore_security',
    name: '🛡️ Hardcore Secure Network',
    badge: 'PROTECTION',
    description: 'Focused on high-security networks with login auth, 2FA, anti-cheat packet inspection, staff tools, combat log guard, ranks, and banking.',
    pluginIds: ['aquaauth', 'aquasecurity', 'aquawatchdog', 'aquastaff', 'aquacombat', 'aquaranks', 'aquachat', 'aquaeconomy'],
    tagColor: 'border-blue-500 bg-blue-950/60 text-blue-300'
  },
  {
    id: 'mmo_rpg',
    name: '🏰 MMO Dungeons & Adventure',
    badge: 'RPG READY',
    description: 'Turn your server into an RPG world with mob arenas, skills leveling, custom enchants, battle pass, rune socketing, market, and fishing.',
    pluginIds: ['aquadungeons', 'aquaskills', 'aquaenchants', 'aquapass', 'aquarunes', 'aquacrates', 'aquamarket', 'aquamap', 'aquafishing', 'aquascoreboard'],
    tagColor: 'border-purple-500 bg-purple-950/60 text-purple-300'
  }
];

interface AquaSuiteHubViewProps {
  onDeployPreset: (pluginIds: string[]) => void;
  installedPluginIds: string[];
}

export const AquaSuiteHubView: React.FC<AquaSuiteHubViewProps> = ({ onDeployPreset, installedPluginIds }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('ultimate');
  const [activeTab, setActiveTab] = useState<'presets' | 'matrix'>('presets');
  const [deployedSuccess, setDeployedSuccess] = useState<boolean>(false);

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_BUNDLES.find(p => p.id === presetId);
    if (!preset) return;
    onDeployPreset(preset.pluginIds);
    setDeployedSuccess(true);
    setTimeout(() => setDeployedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="p-8 bg-gradient-to-r from-[#071324] via-[#0b172a] to-[#0d1c33] rounded-3xl border border-cyan-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-900/80 text-cyan-300 border border-cyan-600/50 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Aqua Ecosystem by efekkoc
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
              Universal 1.20.x – 1.21.4 (1.21.1 & 1.21.4 Ready)
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Deploy Ready-to-Play Server Presets with Zero Friction
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Every core plugin designed, written, and maintained by <span className="text-cyan-300 font-bold">Turgut Efekan Koç (efekkoc)</span>. 
            No third-party conflicts, no mismatched versions. Pick a pre-configured server bundle or customize your own stack with 1-click deployment.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="flex p-1 bg-[#09111e] rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'presets' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Ready Server Presets (Hazır Paketler)
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'matrix' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-4 h-4" />
                Plugin Suite Matrix ({ALL_AQUA_PLUGINS.length} Plugins)
              </button>
            </div>

            {deployedSuccess && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold animate-bounce">
                <Check className="w-4 h-4" />
                Preset Deployed into Server Plugins!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: READY PRESET BUNDLES */}
      {activeTab === 'presets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Choose a Pre-Engineered Server Archetype
              </h3>
              <p className="text-xs text-slate-400">
                1-click activates the entire cohesive bundle directly into your Minecraft server.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRESET_BUNDLES.map(preset => {
              const isSelected = selectedPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-gradient-to-b from-[#0b172a] to-[#071120] border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
                      : 'bg-[#09111e]/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${preset.tagColor}`}>
                        {preset.badge}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {preset.pluginIds.length} Plugins Bundled
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white">{preset.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{preset.description}</p>

                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Included Suite Modules:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {preset.pluginIds.map(pid => {
                          const p = ALL_AQUA_PLUGINS.find(item => item.id === pid);
                          if (!p) return null;
                          return (
                            <span 
                              key={pid} 
                              className="px-2 py-0.8 bg-slate-900/90 text-cyan-300 border border-slate-800 rounded-md text-[11px] font-mono font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                              {p.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      Author: <span className="text-slate-200 font-bold">efekkoc</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyPreset(preset.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Deploy Preset (Hazır Paketi Yükle)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: INDIVIDUAL SUITE MATRIX (ALL 9 PLUGINS) */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                The Complete 9-Plugin Aqua Arsenal
              </h3>
              <p className="text-xs text-slate-400">
                Mix and match individual modules. All plugins natively connect with AquaForge and each other.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_AQUA_PLUGINS.map(p => {
              const IconComp = p.icon;
              const isInstalled = installedPluginIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className="p-5 bg-[#09111e]/90 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shadow-md`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {p.category}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {p.version.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      {p.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="View GitHub Repository"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onDeployPreset([p.id])}
                      className="flex-1 py-1.5 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Install to Server
                    </button>
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
