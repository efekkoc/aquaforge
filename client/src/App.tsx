import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, Shield, Terminal, Bug, Box, RefreshCw, FileCode, PackageOpen, 
  Play, Square, RotateCw, Skull, Activity, Zap, HardDrive, Users, 
  Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight,
  Sliders, UserCheck, AlertOctagon, Download, Code2, Copy, Check, Power, Trash2, Wand2,
  Image as ImageIcon, Video, Github, Search, Plus, FolderSearch, ArrowRight, Save,
  HelpCircle, ExternalLink, X, ChevronDown, UserX, Crown, Megaphone, Bell, Upload,
  Compass, Archive, Layers, Globe, Globe2
} from 'lucide-react';
import { ansiToHtml } from './utils/ansi';
import { ServerStatus, ServerMetrics, DiagnosticReport, PluginMeta, DevSyncWatcher, ResourcePackItem } from './types';
import { AquaMapRadarView } from './components/AquaMapRadarView';
import { VisualPropertiesView } from './components/VisualPropertiesView';
import { BackupVaultView } from './components/BackupVaultView';
import { DiscordBridgeView } from './components/DiscordBridgeView';
import { DependencyMatrixView } from './components/DependencyMatrixView';
import { AquaSuiteHubView } from './components/AquaSuiteHubView';
import { GlobalConnectTunnelView } from './components/GlobalConnectTunnelView';
import { WorldVaultView } from './components/WorldVaultView';
import { ServerWizardModal } from './components/ServerWizardModal';

export const App: React.FC = () => {
  // Navigation & Role Mode (Admin vs Developer)
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'diagnostics' | 'plugins' | 'devsync' | 'config' | 'resourcepack' | 'map' | 'properties' | 'backups' | 'discord' | 'dependencies' | 'players' | 'settings' | 'suite' | 'tunnel' | 'world'>('overview');
  const [userRole, setUserRole] = useState<'admin' | 'developer'>('admin');
  const [showServerWizard, setShowServerWizard] = useState<boolean>(false);
  
  // Selected Minecraft Version (Dynamic All-Era Database)
  const [mcVersion, setMcVersion] = useState<string>('1.21.4 – The Garden Awakens');
  
  const MINECRAFT_VERSIONS_DATA = [
    {
      era: '4. Yeni Takvim Bazlı Sürüm Sistemi (2026 ve Sonrası)',
      versions: [
        { id: '26.3 – Wilderness Bound', name: '26.3 – Wilderness Bound (Eylül 2026)', date: 'Eylül 2026', features: 'Benekli Orman (Dappled Forest), Yeni Vahşi Yaşam & Güvenlik' },
        { id: '26.2 – Chaos Cubed', name: '26.2 – Chaos Cubed (Haziran 2026)', date: 'Haziran 2026', features: 'Sülfür Mağaraları, Sülfür Küpü Mobu & Vulkan Sürücüsü' },
        { id: '26.1 – Tiny Takeover', name: '26.1 – Tiny Takeover (Mart 2026)', date: 'Mart 2026', features: 'Bebek Mob Modelleri, Altın Karahindiba & İsim Etiketleri' }
      ]
    },
    {
      era: '3. "Game Drops" Dönemi (1.21.x: 2024 – 2025)',
      versions: [
        { id: '1.21.11 – Mounts of Mayhem', name: '1.21.11 – Mounts of Mayhem (Aralık 2025)', date: 'Aralık 2025', features: 'Mızrak (Spear), Nautilus Binekleri, Netherite At Zırhı' },
        { id: '1.21.9 – The Copper Age', name: '1.21.9 – The Copper Age (Eylül 2025)', date: 'Eylül 2025', features: 'Bakır Zırh/Alet Seti, Bakır Golem Otomasyonu, Raflar' },
        { id: '1.21.6 – Chase the Skies', name: '1.21.6 – Chase the Skies (Haziran 2025)', date: 'Haziran 2025', features: 'Üretilebilir Eyerler, Player Locator & Happy Ghast' },
        { id: '1.21.5 – Spring to Life', name: '1.21.5 – Spring to Life (İlkbahar 2025)', date: 'İlkbahar 2025', features: 'İnek/Domuz/Tavuk Varyasyonları, Kır Çiçekleri' },
        { id: '1.21.4 – The Garden Awakens', name: '1.21.4 – The Garden Awakens (Aralık 2024)', date: 'Aralık 2024', features: 'Soluk Bahçe (Pale Garden), Creaking, Göz Salkımı' },
        { id: '1.21.3 – Bundles of Bravery', name: '1.21.3 – Bundles of Bravery (Ekim 2024)', date: 'Ekim 2024', features: 'Çıkınlar (Bundles) ve Hardcore Mod Güncellemeleri' },
        { id: '1.21 – Tricky Trials', name: '1.21 – Tricky Trials (Haziran 2024)', date: 'Haziran 2024', features: 'Trial Chambers, Breeze, Topuz (Mace) ve Crafter' }
      ]
    },
    {
      era: '2. Klasik Sürüm Numaralandırması (Java Edition 1.x: 2011 – 2024)',
      versions: [
        { id: '1.20 – Trails & Tales', name: '1.20 – Trails & Tales (Haziran 2023)', date: 'Haziran 2023', features: 'Arkeoloji, Deve, Kiraz Çiçeği ve Armor Trims' },
        { id: '1.19 – The Wild Update', name: '1.19 – The Wild Update (Haziran 2022)', date: 'Haziran 2022', features: 'Deep Dark, Warden, Antik Şehirler, Mangrov' },
        { id: '1.18 – Caves & Cliffs Part II', name: '1.18 – Caves & Cliffs: Part II (Kasım 2021)', date: 'Kasım 2021', features: 'Devasa Mağara/Dağlar, Y=-64 Taban Sınırı' },
        { id: '1.17 – Caves & Cliffs Part I', name: '1.17 – Caves & Cliffs: Part I (Haziran 2021)', date: 'Haziran 2021', features: 'Bakır, Ametist, Aksolotl ve Keçiler' },
        { id: '1.16 – Nether Update', name: '1.16 – Nether Update (Haziran 2020)', date: 'Haziran 2020', features: 'Sıfırdan Yenilenen Nether, Piglinler ve Netherite' },
        { id: '1.15 – Buzzy Bees', name: '1.15 – Buzzy Bees (Aralık 2019)', date: 'Aralık 2019', features: 'Arılar, Kovanlar, Bal Blokları ve Optimizasyon' },
        { id: '1.14 – Village & Pillage', name: '1.14 – Village & Pillage (Nisan 2019)', date: 'Nisan 2019', features: 'Yenilenen Köyler, Yağmacılar, Baskınlar, Çapraz Yay' },
        { id: '1.13 – Update Aquatic', name: '1.13 – Update Aquatic (Temmuz 2018)', date: 'Temmuz 2018', features: 'Okyanuslar, Batıklar, Yunuslar, Üçlü Mızrak, Drowned' },
        { id: '1.12 – The World of Color', name: '1.12 – The World of Color (Haziran 2017)', date: 'Haziran 2017', features: 'Beton, Terakota, Papağanlar ve Tarif Kitabı' },
        { id: '1.11 – The Exploration Update', name: '1.11 – The Exploration Update (Kasım 2016)', date: 'Kasım 2016', features: 'Orman Malikanesi, Totem, Lamalar ve Shulker' },
        { id: '1.10 – The Frostburn Update', name: '1.10 – The Frostburn Update (Haziran 2016)', date: 'Haziran 2016', features: 'Kutup Ayıları, Magma Blokları, Husk ve Stray' },
        { id: '1.9 – The Combat Update', name: '1.9 – The Combat Update (Şubat 2016)', date: 'Şubat 2016', features: 'Yenilenen Dövüş, Çift El, Kalkan, Elitra ve Shulker' },
        { id: '1.8 – The Bountiful Update', name: '1.8 – The Bountiful Update (Eylül 2014)', date: 'Eylül 2014', features: 'Okyanus Anıtları, Slime Blokları, Zırh Askısı' },
        { id: '1.7 – The Update That Changed The World', name: '1.7 – The Update That Changed The World (Ekim 2013)', date: 'Ekim 2013', features: 'Lekeli Camlar, Savana, Açelya ve Çiçekler' },
        { id: '1.6 – Horse Update', name: '1.6 – Horse Update (Temmuz 2013)', date: 'Temmuz 2013', features: 'Atlar, Eşekler, Katırlar ve Tasmalar' },
        { id: '1.5 – Redstone Update', name: '1.5 – Redstone Update (Mart 2013)', date: 'Mart 2013', features: 'Karşılaştırıcı, Huni (Hopper) ve Redstone Blokları' },
        { id: '1.4 – Pretty Scary Update', name: '1.4 – Pretty Scary Update (Ekim 2012)', date: 'Ekim 2012', features: 'Wither, Cadı, Örs ve Komut Blokları' },
        { id: '1.3', name: '1.3 (Temmuz 2012)', date: 'Temmuz 2012', features: 'Zümrüt, Köylü Ticareti ve Çöl/Orman Tapınakları' },
        { id: '1.2', name: '1.2 (Mart 2012)', date: 'Mart 2012', features: 'Orman Biyomu, Demir Golem, Kediler, 256 Blok Sınırı' },
        { id: '1.1', name: '1.1 (Ocak 2012)', date: 'Ocak 2012', features: 'Spawn Yumurtaları ve Türkçe Dil Desteği' },
        { id: '1.0.0 – Adventure Update', name: '1.0.0 – Adventure Update (Kasım 2011)', date: 'Kasım 2011', features: 'Tam Sürüm! Ender Ejderhası, The End ve İksirler' }
      ]
    },
    {
      era: '1. İlk Geliştirme Dönemleri (2009 – 2011)',
      versions: [
        { id: 'Beta (2010 – 2011)', name: 'Beta (Aralık 2010 – Kasım 2011)', date: '2010 – 2011', features: 'Açlık Barı, Pistonlar, XP, Köyler ve Stronghold' },
        { id: 'Alpha (2010)', name: 'Alpha (Haziran 2010 – Aralık 2010)', date: '2010', features: 'Redstone, Nether Boyutu, Biyomlar ve Sesler' },
        { id: 'Infdev (2010)', name: 'Infdev (Şubat 2010 – Haziran 2010)', date: '2010', features: 'Sonsuz Harita Nesli (Infinite Worlds)' },
        { id: 'Indev (2010)', name: 'Indev (Ocak 2010 – Şubat 2010)', date: '2010', features: 'Envanter, Gece-Gündüz, Crafting & Yaratıklar' },
        { id: 'Classic (2009)', name: 'Classic (Mayıs 2009 – Aralık 2009)', date: '2009', features: 'Çok Oyunculu Mod, TNT ve İlk Temel Bloklar' },
        { id: 'Pre-Classic / Cave Game (2009)', name: 'Pre-Classic / Cave Game (Mayıs 2009)', date: '2009', features: 'Markus "Notch" Persson İlk Konsept Testi' }
      ]
    }
  ];

  const activeVersionInfo = MINECRAFT_VERSIONS_DATA.flatMap(g => g.versions).find(v => v.id === mcVersion) || {
    id: mcVersion,
    name: mcVersion,
    date: 'Aktif Sürüm',
    features: 'Universal Minecraft Profile'
  };

  // Info Modal Guide State
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Server State
  const [status, setStatus] = useState<ServerStatus>('OFFLINE');
  const [metrics, setMetrics] = useState<ServerMetrics>({
    tps: 0.0,
    mspt: 0.0,
    memoryUsedMB: 0,
    memoryMaxMB: 4096,
    cpuPercent: 0.0,
    onlinePlayers: 0,
    maxPlayers: 50,
    uptimeSeconds: 0
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [plugins, setPlugins] = useState<PluginMeta[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(['tps', 'spark health', 'list', 'save-all']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const tempCommandRef = useRef<string>('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' | 'error' } | null>(null);

  // Background Media Customizer
  const [bgMediaUrl, setBgMediaUrl] = useState<string>('/background.mp4');
  const [bgType, setBgType] = useState<'none' | 'image' | 'video'>('video');
  const [bgOpacity, setBgOpacity] = useState<number>(45);

  // Diagnostics state
  const [expandedReportId, setExpandedReportId] = useState<string | null>('demo-diagnostic-1');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Config Studio state
  const [selectedConfigPath, setSelectedConfigPath] = useState('plugins/AquaFishing/config.yml');
  const [configContent, setConfigContent] = useState('');

  // DevSync state
  const [watchers, setWatchers] = useState<DevSyncWatcher[]>([]);
  const [newWatcherName, setNewWatcherName] = useState('MyPlugin Watcher');
  const [newWatcherDir, setNewWatcherDir] = useState('/Users/efekoc/AquaFishing/build/libs');
  const [newWatcherTarget, setNewWatcherTarget] = useState('AquaFishing-1.0.0.jar');

  // Resource Pack state
  const [packs, setPacks] = useState<ResourcePackItem[]>([]);

  // Helper to format file sizes accurately
  const formatFileSize = (bytes: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 KB';
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Dynamic GitHub Repos Sync state (Neutral: global user can search any profile)
  const [githubUser, setGithubUser] = useState('');
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [installingRepo, setInstallingRepo] = useState<string | null>(null);

  // Admin Mode: Live Players List (Defaults to empty when server is offline)
  const [playersList, setPlayersList] = useState<Array<{ name: string; ping: number; ip: string; isOp: boolean }>>([]);

  // Admin Sliders State
  const [adminRam, setAdminRam] = useState(4);
  const [adminMaxPlayers, setAdminMaxPlayers] = useState(50);
  const [adminDifficulty, setAdminDifficulty] = useState('normal');
  const [adminWhitelist, setAdminWhitelist] = useState(false);

  // Refs
  const logContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Fetch & WebSocket
  const refreshAll = () => {
    fetch('/api/server/status').then(r => r.json()).then(d => {
      if (d.status) setStatus(d.status);
      if (d.metrics) setMetrics(d.metrics);
    }).catch(() => {});

    fetch('/api/server/logs').then(r => r.json()).then(d => setLogs(d.logs || [])).catch(() => {});
    fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || [])).catch(() => {});
    fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])).catch(() => {});
    fetch('/api/devsync').then(r => r.json()).then(d => setWatchers(d.watchers || [])).catch(() => {});
    fetch('/api/resourcepacks').then(r => r.json()).then(d => setPacks(d.packs || [])).catch(() => {});
    
    // Load default config
    fetch(`/api/configs/read?path=${encodeURIComponent(selectedConfigPath)}`)
      .then(r => r.json())
      .then(d => setConfigContent(d.content || ''))
      .catch(() => {});
  };

  const fetchGithubUserRepos = (username: string) => {
    setLoadingRepos(true);
    fetch(`/api/marketplace/github-user/${encodeURIComponent(username)}`)
      .then(r => r.json())
      .then(d => {
        setUserRepos(d.repos || []);
        setLoadingRepos(false);
      })
      .catch(() => setLoadingRepos(false));
  };

  useEffect(() => {
    refreshAll();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === 'init') {
          setStatus(data.status);
          setMetrics(data.metrics);
          setLogs(data.logs || []);
        } else if (type === 'console_log') {
          setLogs(prev => [...prev, data.line]);
          if (data.line.includes('Exception') || data.line.includes('Error')) {
            fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || []));
          }
        } else if (type === 'metrics_update') {
          setMetrics(data);
        } else if (type === 'status_change') {
          setStatus(data.status);
        } else if (type === 'devsync_trigger') {
          showToast(`⚡ Dev-Sync: ${data.fileName} hot-swapped into plugins!`, 'success');
          fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || []));
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Server Actions
  const handleServerAction = (action: 'start' | 'stop' | 'restart' | 'kill') => {
    fetch(`/api/server/${action}`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        showToast(d.message, action === 'kill' ? 'error' : 'success');
        refreshAll();
      });
  };

  const handleSendCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    // Update history (prepend or deduplicate)
    setCommandHistory(prev => [trimmed, ...prev.filter(c => c !== trimmed)].slice(0, 50));
    setHistoryIndex(-1);
    tempCommandRef.current = '';

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', data: trimmed }));
    } else {
      fetch('/api/server/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed })
      });
    }
    setCommandInput('');
  };

  const handleTriggerError = () => {
    fetch('/api/server/trigger-error', { method: 'POST' })
      .then(() => {
        showToast('⚠ Live Exception injected! Check Bug Hunter tab.', 'warn');
        setTimeout(() => {
          fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || []));
        }, 400);
      });
  };

  const handleDeployPreset = (pluginIds: string[]) => {
    fetch('/api/suite/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginIds })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          showToast(`🚀 Deployed ${d.total} Aqua Suite plugins into server!`, 'success');
          fetch('/api/plugins').then(r => r.json()).then(p => setPlugins(p.plugins || []));
        } else {
          showToast('Failed to deploy plugins', 'error');
        }
      })
      .catch(() => showToast('Error contacting orchestrator', 'error'));
  };

  const handleTogglePlugin = (fileName: string) => {
    fetch(`/api/plugins/${fileName}/toggle`, { method: 'POST' })
      .then(() => fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/plugins/upload', {
      method: 'POST',
      body: formData,
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          showToast(`Plugin ${file.name} uploaded successfully!`, 'success');
          fetch('/api/plugins').then(r => r.json()).then(p => setPlugins(p.plugins || []));
        } else {
          showToast('Failed to upload plugin', 'error');
        }
      })
      .catch(() => showToast('Error uploading plugin', 'error'));
  };

  const handleDeployGithubRelease = (repoName: string) => {
    setInstallingRepo(repoName);
    fetch(`/api/marketplace/github-releases/${repoName}`)
      .then(r => r.json())
      .then(async (d) => {
        const release = d.releases?.[0];
        const jarName = release?.jarAsset?.name || `${repoName}-latest.jar`;
        const res = await fetch('/api/marketplace/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: jarName, downloadUrl: release?.jarAsset?.downloadUrl })
        });
        const resJson = await res.json();
        showToast(resJson.message, 'success');
        fetch('/api/plugins').then(r => r.json()).then(pl => setPlugins(pl.plugins || []));
      })
      .finally(() => setInstallingRepo(null));
  };

  const handleAddWatcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatcherDir) return;
    fetch('/api/devsync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `watcher-${Date.now()}`,
        name: newWatcherName,
        sourceDirectory: newWatcherDir,
        targetPluginName: newWatcherTarget,
        active: true
      })
    }).then(() => {
      showToast(`Watcher active for ${newWatcherName}`, 'success');
      fetch('/api/devsync').then(r => r.json()).then(d => setWatchers(d.watchers || []));
    });
  };

  const unresolvedCount = reports.filter(r => !r.resolved).length;

  return (
    <div className="relative min-h-screen bg-[#070a10] text-[#e2e8f0] font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Dynamic Background: Video, Image, or Ambient Grid */}
      {bgType === 'video' && bgMediaUrl ? (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{ opacity: bgOpacity / 100 }}
          src={bgMediaUrl}
        />
      ) : bgType === 'image' && bgMediaUrl ? (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
          style={{ backgroundImage: `url(${bgMediaUrl})`, opacity: bgOpacity / 100 }}
        />
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/15 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>
      )}

      {/* Main Glass Layout Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ${
            toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50' :
            toast.type === 'warn' ? 'bg-amber-950/90 text-amber-200 border-amber-500/50' :
            'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{toast.msg}</span>
          </div>
        )}

        {/* ================= TOP NAVIGATION HUD ================= */}
        <header className="h-24 px-4 sm:px-6 bg-[#0a0f18]/95 backdrop-blur-xl border-b border-[#182336] flex items-center justify-between sticky top-0 z-30 shadow-2xl gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            
            {/* BIG PROMINENT LOGO & BRANDING */}
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.8)] border-2 border-cyan-400 bg-gradient-to-br from-cyan-950 via-slate-900 to-black flex items-center justify-center flex-shrink-0 group hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="AquaForge Universal Logo" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const svg = document.getElementById('aquaforge-svg-fallback');
                      if (svg) svg.style.display = 'flex';
                    }
                  }}
                  className="w-full h-full object-cover" 
                />
                {/* SVG Fallback */}
                <div id="aquaforge-svg-fallback" className="hidden w-full h-full items-center justify-center text-cyan-400 bg-cyan-950">
                  <Server className="w-10 h-10 animate-pulse" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-black text-xl sm:text-2xl lg:text-3xl tracking-widest bg-gradient-to-r from-cyan-300 via-teal-200 to-white bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(6,182,212,0.7)] shrink-0">
                    AQUAFORGE
                  </span>

                  {/* DYNAMIC MINECRAFT ALL-ERA VERSION SELECTOR (Responsive auto-truncated) */}
                  <div className="relative inline-block max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[270px]">
                    <select
                      value={mcVersion}
                      onChange={(e) => {
                        setMcVersion(e.target.value);
                        showToast(`Switched active profile to ${e.target.value}`, 'success');
                      }}
                      className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 focus:outline-none cursor-pointer pr-7 appearance-none shadow-md hover:border-cyan-400 transition-colors truncate w-full"
                    >
                      {MINECRAFT_VERSIONS_DATA.map((group) => (
                        <optgroup key={group.era} label={group.era} className="bg-slate-950 text-cyan-400 font-bold">
                          {group.versions.map((ver) => (
                            <option key={ver.id} value={ver.id} className="bg-slate-900 text-slate-200 py-1">
                              {ver.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 truncate">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50 shrink-0">
                    Studio
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate">
                    Created by <span className="text-cyan-300 font-bold">Turgut Efekan Koç (efekkoc)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Server Status Pill (Visible on wider screens to prevent header squeeze) */}
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e1626] border border-slate-800 text-xs font-mono whitespace-nowrap shrink-0">
              <span className={`w-2 h-2 rounded-full ${
                status === 'ONLINE' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                status === 'STARTING' ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
              }`} />
              <span className="text-slate-300 font-bold">{status}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Port 25565</span>
            </div>
          </div>

          {/* Center Telemetry Gauges (Only shown when server is actually ONLINE and space permits) */}
          {status === 'ONLINE' && (
            <div className="hidden 2xl:flex items-center gap-6 px-4 py-2 bg-[#0b1220]/90 rounded-xl border border-[#1b273d] text-xs font-mono whitespace-nowrap shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">TPS:</span>
                <span className="font-bold text-cyan-300">{metrics.tps.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">MSPT:</span>
                <span className="font-bold text-emerald-400">{metrics.mspt.toFixed(1)}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400">RAM:</span>
                <span className="font-bold text-purple-300">{(metrics.memoryUsedMB / 1024).toFixed(1)} / {(metrics.memoryMaxMB / 1024).toFixed(0)} GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Players:</span>
                <span className="font-bold text-amber-300">{metrics.onlinePlayers} / {metrics.maxPlayers}</span>
              </div>
            </div>
          )}

          {/* Right Controls: Role Switcher & Power Buttons & Info (ALWAYS VISIBLE & LOCKED) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* 1-Click Server Wizard Trigger */}
            <button
              onClick={() => setShowServerWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-cyan-900/40"
              title="30-Second Server Setup Wizard"
            >
              <Wand2 className="w-3.5 h-3.5 animate-spin-slow" />
              <span>1-Click Wizard</span>
            </button>

            {/* Guide / Info Modal Trigger */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
              title="How to Use AquaForge Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Guide & Info</span>
            </button>

            {/* Role Switcher: 👑 Admin Mode vs ⚡ Developer Mode */}
            <div className="flex p-0.5 bg-[#0e1626] rounded-xl border border-[#1e2a40] text-xs font-semibold">
              <button
                onClick={() => {
                  setUserRole('admin');
                  setActiveTab('overview');
                  showToast('Switched to Server Admin View (Simple & Safe)', 'success');
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  userRole === 'admin' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => {
                  setUserRole('developer');
                  setActiveTab('diagnostics');
                  showToast('Switched to Developer View (Bug Hunter & Hot-Swap)', 'success');
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  userRole === 'developer' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Developer</span>
              </button>
            </div>

            {/* Power Controls (Always guaranteed room) */}
            {status === 'OFFLINE' ? (
              <button
                onClick={() => handleServerAction('start')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/40 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Server</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleServerAction('restart')}
                  className="p-2 bg-[#0e1726] hover:bg-[#15233a] border border-[#1e2d48] text-cyan-400 rounded-xl transition-all cursor-pointer"
                  title="Graceful Restart"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleServerAction('stop')}
                  className="p-2 bg-[#0e1726] hover:bg-[#15233a] border border-amber-500/30 text-amber-400 rounded-xl transition-all cursor-pointer"
                  title="Safe Stop"
                >
                  <Square className="w-4 h-4 fill-amber-400" />
                </button>
                <button
                  onClick={() => handleServerAction('kill')}
                  className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 rounded-xl transition-all cursor-pointer"
                  title="Force Kill"
                >
                  <Skull className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= APP BODY ================= */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Side Navigation Bar (Role-Dependent Tabs!) */}
          <aside className="w-60 bg-[#090d16]/90 backdrop-blur-xl border-r border-[#152033] flex flex-col justify-between p-3 select-none">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between">
                <span>{userRole === 'admin' ? '🛡 Admin Controls' : '⚡ Developer Suite'}</span>
                <span className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              </div>

              {/* TABS FOR ADMIN MODE */}
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'overview' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Server Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('suite')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'suite' ? 'bg-gradient-to-r from-cyan-950 to-teal-950 text-cyan-300 border border-cyan-500 shadow-lg' : 'text-slate-300 hover:bg-slate-900 border border-cyan-900/40 bg-cyan-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="font-bold">Aqua Suite Hub</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-bold">
                      PRESETS
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tunnel')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'tunnel' ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>Global Play Tunnel</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold">
                      EDGE
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('world')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'world' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Globe2 className="w-4 h-4 text-teal-400" />
                    <span>World Vault & Seeds</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('map')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'map' ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>AquaMap Live Radar</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-bold">
                      RADAR
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'properties' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Server Tuning & Config</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('backups')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'backups' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Archive className="w-4 h-4 text-amber-400" />
                    <span>Backup Vault</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('discord')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'discord' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span>Discord Alert Bridge</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'terminal' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span>Live Console</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('plugins')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'plugins' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Box className="w-4 h-4 text-blue-400" />
                      <span>Plugins List</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                      {plugins.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resourcepack')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'resourcepack' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <PackageOpen className="w-4 h-4 text-purple-400" />
                    <span>Resource Packs</span>
                  </button>
                </>
              )}

              {/* TABS FOR DEVELOPER MODE */}
              {userRole === 'developer' && (
                <>
                  <button
                    onClick={() => setActiveTab('suite')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'suite' ? 'bg-gradient-to-r from-cyan-950 to-teal-950 text-cyan-300 border border-cyan-500 shadow-lg' : 'text-slate-300 hover:bg-slate-900 border border-cyan-900/40 bg-cyan-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="font-bold">Aqua Suite Hub</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-bold">
                      PRESETS
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tunnel')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'tunnel' ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>Global Play Tunnel</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold">
                      EDGE
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('world')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'world' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Globe2 className="w-4 h-4 text-teal-400" />
                    <span>World Vault & Seeds</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'diagnostics' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bug className="w-4 h-4 text-red-400" />
                      <span>Bug Hunter Studio</span>
                    </div>
                    {unresolvedCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-red-600 text-white font-bold">
                        {unresolvedCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('devsync')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'devsync' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span>Dev-Sync & Hot-Swap</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                      AUTO
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'dependencies' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Dependency Matrix</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('config')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'config' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span>YAML Config Studio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('map')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'map' ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/70 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>AquaMap Live Radar</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-bold">
                      RADAR
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'terminal' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Interactive Console</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('plugins')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'plugins' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Box className="w-4 h-4 text-blue-400" />
                      <span>Vault & GitHub Repos</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                      {plugins.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'overview' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-md' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Server className="w-4 h-4 text-slate-400" />
                    <span>Server Telemetry</span>
                  </button>
                </>
              )}
            </div>

            {/* Bottom Credits & Background Media Selector */}
            <div className="space-y-2 pt-3 border-t border-[#152033]">
              {/* Permanent Creator Info & GitHub link */}
              <div className="p-3 bg-gradient-to-r from-[#0d1626] to-[#121c2e] rounded-xl border border-cyan-900/50 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white tracking-wide">Turgut Efekan Koç</span>
                  <a 
                    href="https://github.com/efekkoc" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                    title="Visit GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400">Created by <span className="text-cyan-300 font-semibold">efekkoc</span></p>
                <div className="flex gap-2 pt-1 text-[10px] font-mono text-slate-500">
                  <a href="https://github.com/efekkoc/AquaFishing" target="_blank" rel="noreferrer" className="hover:text-cyan-400">AquaFishing</a>
                  <span>•</span>
                  <a href="https://github.com/efekkoc/AquaMap" target="_blank" rel="noreferrer" className="hover:text-cyan-400">AquaMap</a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 p-6 overflow-y-auto">

            {/* ================= TAB 1: OVERVIEW (ADMIN & DEV) ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* Admin Mode Quick Banner with Operational Tools */}
                {userRole === 'admin' ? (
                  <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-[#0e2133] to-[#0a1524] rounded-2xl border border-emerald-600/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        Server Administrator Dashboard • {mcVersion}
                      </div>
                      <h3 className="text-base font-bold text-white">Safe Operational Controls for Server Owners</h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        Clean server management: Zero coding required. Broadcast alerts, clear lag, and tune performance with safe 1-click buttons.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          handleSendCommand('kill @e[type=item]');
                          showToast('Executed: Cleared dropped ground items!', 'success');
                        }}
                        className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all"
                      >
                        🧹 Clear Ground Lag
                      </button>
                      <button
                        onClick={() => {
                          handleSendCommand('save-all');
                          showToast('Executed: World data saved to disk!', 'success');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        💾 Save World
                      </button>
                      <button
                        onClick={() => {
                          const msg = prompt('Enter message to broadcast to all players:');
                          if (msg) {
                            handleSendCommand(`broadcast §6[Server] §f${msg}`);
                            showToast(`Broadcasted message to server`, 'success');
                          }
                        }}
                        className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/40 text-cyan-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        📢 Broadcast
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-[#0e2133] to-[#0a1524] rounded-2xl border border-cyan-600/30 flex items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        <Code2 className="w-4 h-4" />
                        Developer Diagnostic Workspace • {mcVersion}
                      </div>
                      <h3 className="text-base font-bold text-white">Bytecode Jar Extraction & Log Interceptor</h3>
                      <p className="text-xs text-slate-300">
                        Plugin testing suite for Paper/Purpur. Real-time stack trace triage and automated build hot-swap enabled.
                      </p>
                    </div>
                    <button
                      onClick={handleTriggerError}
                      className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Bug className="w-4 h-4" />
                      Simulate Plugin Crash
                    </button>
                  </div>
                )}

                {/* Telemetry Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* TPS Gauge */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Server Tick Rate</span>
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${status === 'ONLINE' ? 'text-cyan-300' : 'text-slate-600'}`}>
                        {status === 'ONLINE' ? metrics.tps.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ 20.0</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" 
                        style={{ width: `${status === 'ONLINE' ? (metrics.tps / 20) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      {status === 'ONLINE' ? '✔ Running at peak 20.0 tick rate' : '○ Server offline (Standby mode)'}
                    </p>
                  </div>

                  {/* MSPT Budget */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Tick Time (MSPT)</span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${status === 'ONLINE' ? 'text-emerald-300' : 'text-slate-600'}`}>
                        {status === 'ONLINE' ? metrics.mspt.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ms (50ms budget)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" 
                        style={{ width: `${status === 'ONLINE' ? (metrics.mspt / 50) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {status === 'ONLINE' ? `${(50 - metrics.mspt).toFixed(1)}ms tick headroom` : 'Awaiting server launch'}
                    </p>
                  </div>

                  {/* RAM Utilization */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Allocated JVM RAM</span>
                      <HardDrive className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${status === 'ONLINE' ? 'text-purple-300' : 'text-slate-600'}`}>
                        {status === 'ONLINE' ? (metrics.memoryUsedMB / 1024).toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">GB / {(metrics.memoryMaxMB / 1024).toFixed(0)} GB</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                        style={{ width: `${status === 'ONLINE' ? (metrics.memoryUsedMB / metrics.memoryMaxMB) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Garbage Collector: <span className="text-purple-300 font-mono">G1GC</span>
                    </p>
                  </div>

                  {/* Online Players (Accurate: 0 when offline!) */}
                  <div className="p-5 bg-[#0b101c]/90 rounded-2xl border border-[#182338] shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Online Players</span>
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${status === 'ONLINE' ? 'text-amber-300' : 'text-slate-600'}`}>
                        {status === 'ONLINE' ? metrics.onlinePlayers : 0}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ {metrics.maxPlayers} slots</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400" 
                        style={{ width: `${status === 'ONLINE' ? (metrics.onlinePlayers / metrics.maxPlayers) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {status === 'ONLINE' ? `${metrics.onlinePlayers} players connected` : 'No players (Server offline)'}
                    </p>
                  </div>
                </div>

                {/* Bug Alert Banner if Unresolved Exception Exists */}
                {unresolvedCount > 0 && (
                  <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                        <AlertOctagon className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-300">
                          {unresolvedCount} Active Exception Detected in Server Logs
                        </h4>
                        <p className="text-xs text-slate-300">
                          Culprit: <span className="font-bold text-white">{reports[0]?.culpritPlugin || 'Plugin'}</span> ({reports[0]?.location?.fileName}:{reports[0]?.location?.lineNumber}). Code fix is ready in Bug Hunter Studio.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserRole('developer');
                        setActiveTab('diagnostics');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      Inspect in Bug Hunter
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Server Details & Plugin Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Server Properties */}
                  <div className="lg:col-span-2 p-6 bg-[#0b101c]/90 rounded-2xl border border-[#182338] space-y-4">
                    <h4 className="text-sm font-bold text-slate-200">Active Profile & Engine Information</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Server Profile</span>
                        <span className="font-bold text-cyan-300 font-mono">{mcVersion}</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Java Runtime</span>
                        <span className="font-bold text-emerald-400 font-mono">JDK 21 (Temurin)</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Tick Processing</span>
                        <span className="font-bold text-slate-200 font-mono">Threaded Region</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Default Port</span>
                        <span className="font-bold text-slate-200 font-mono">25565 (IPv4)</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Installed Plugins</span>
                        <span className="font-bold text-cyan-400 font-mono">{plugins.length} Plugins</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block mb-1">Build Watcher</span>
                        <span className="font-bold text-emerald-400 font-mono">Chokidar Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Plugins List */}
                  <div className="p-6 bg-[#0b101c]/90 rounded-2xl border border-[#182338] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200">Active Plugins ({plugins.length})</h4>
                      <button 
                        onClick={() => setActiveTab('plugins')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="space-y-2">
                      {plugins.slice(0, 4).map((p) => (
                        <div key={p.fileName} className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200">{p.name}</span>
                            <span className="text-[10px] text-cyan-400 font-mono ml-2">v{p.version} • {formatFileSize(p.fileSizeBytes)}</span>
                          </div>
                          <button
                            onClick={() => handleTogglePlugin(p.fileName)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              p.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {p.enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB 2: LIVE TERMINAL ================= */}
            {activeTab === 'terminal' && (
              <div className="h-[calc(100vh-8rem)] flex flex-col bg-[#070b13] rounded-2xl border border-[#19243a] overflow-hidden shadow-2xl">
                {/* Terminal Toolbar */}
                <div className="h-12 px-4 bg-[#0d1424] border-b border-[#182338] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200 font-mono">PaperMC Server Console ({mcVersion})</span>
                    <span className="text-[10px] font-mono text-slate-500">({logs.length} lines)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTriggerError}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      Trigger Test Error
                    </button>
                    <button
                      onClick={() => setLogs([])}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Output Stream */}
                <div
                  ref={logContainerRef}
                  className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 terminal-scroll select-text leading-relaxed bg-[#05080e]"
                >
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 italic">
                      Terminal is ready. Click 'Start Server' to view live Paper logs.
                    </div>
                  ) : (
                    logs.map((line, idx) => (
                      <div 
                        key={idx} 
                        className="hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors"
                        dangerouslySetInnerHTML={{ __html: ansiToHtml(line) }} 
                      />
                    ))
                  )}
                </div>

                {/* Quick Chips & Command Bar */}
                <div className="p-3 bg-[#0d1424] border-t border-[#182338] space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      <span className="text-slate-500 font-sans text-xs">Quick:</span>
                      {['tps', 'spark health', 'list', 'save-all', 'plugins', 'whitelist on', 'help'].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleSendCommand(c)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          /{c}
                        </button>
                      ))}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-slate-400">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-slate-400">↓</kbd>
                      <span>History</span>
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendCommand(commandInput);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/60 border border-slate-800 rounded-xl focus-within:border-cyan-500/50">
                      <span className="text-cyan-400 font-mono font-bold">&gt;</span>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (commandHistory.length === 0) return;
                            if (historyIndex === -1) {
                              tempCommandRef.current = commandInput;
                            }
                            const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
                            setHistoryIndex(nextIdx);
                            setCommandInput(commandHistory[nextIdx]);
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (historyIndex > 0) {
                              const nextIdx = historyIndex - 1;
                              setHistoryIndex(nextIdx);
                              setCommandInput(commandHistory[nextIdx]);
                            } else if (historyIndex === 0) {
                              setHistoryIndex(-1);
                              setCommandInput(tempCommandRef.current);
                            }
                          }
                        }}
                        placeholder="Type a Minecraft command (e.g. tps, help, gamemode survival) • Use ↑ / ↓ for history..."
                        className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Execute
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ================= TAB 3: ADMIN LIVE PLAYERS ================= */}
            {activeTab === 'players' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-emerald-600/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      Connected Players Manager ({status === 'ONLINE' ? playersList.length : 0})
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Safe administrative actions: Kick griefers, ban cheaters, or grant Operator status without typing console commands.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const name = prompt('Add/Simulate player joining server:');
                      if (name) {
                        setPlayersList(prev => [...prev, { name, ping: Math.floor(Math.random() * 40) + 10, ip: '127.0.0.1', isOp: false }]);
                        showToast(`Player ${name} joined!`, 'success');
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    + Add Player
                  </button>
                </div>

                <div className="bg-[#0b101c] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-400 flex items-center justify-between">
                    <span>Player Name</span>
                    <span>Latency & Controls</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {playersList.length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                          <Users className="w-6 h-6 text-slate-500" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-300">No Active Players Connected</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          {status === 'ONLINE' 
                            ? 'Server is online on port 25565. When players join, their real Minecraft gamertags, network latency ping, and kick/ban controls will appear here.'
                            : 'Server is currently offline. Start the server using the green "Start Server" button at the top to accept player connections.'
                          }
                        </p>
                      </div>
                    ) : (
                      playersList.map((p) => (
                        <div key={p.name} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center font-bold font-mono text-emerald-300 text-xs">
                              {p.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-200">{p.name}</span>
                                {p.isOp && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                                    <Crown className="w-3 h-3" /> OP
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">IP: {p.ip}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 mr-2">{p.ping}ms</span>
                            <button
                              onClick={() => {
                                handleSendCommand(`kick ${p.name} Administrative reason`);
                                setPlayersList(prev => prev.filter(x => x.name !== p.name));
                                showToast(`Kicked player ${p.name}`, 'warn');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-400 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Kick
                            </button>
                            <button
                              onClick={() => {
                                handleSendCommand(`ban ${p.name} Banned by Admin`);
                                setPlayersList(prev => prev.filter(x => x.name !== p.name));
                                showToast(`Banned player ${p.name}`, 'error');
                              }}
                              className="px-2.5 py-1 bg-red-950/50 hover:bg-red-900 text-red-300 border border-red-700/50 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Ban
                            </button>
                            <button
                              onClick={() => {
                                p.isOp = !p.isOp;
                                handleSendCommand(p.isOp ? `op ${p.name}` : `deop ${p.name}`);
                                showToast(`${p.name} is now ${p.isOp ? 'Operator (OP)' : 'Regular Member'}`, 'success');
                                setPlayersList([...playersList]);
                              }}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                p.isOp ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                              title="Toggle OP status"
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: ADMIN SERVER TUNING & SLIDERS ================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    Server Configuration & JVM Tuning Sliders
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust essential server properties without manually editing server.properties or startup scripts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* RAM Allocation Slider */}
                  <div className="p-6 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">JVM Memory Allocation (-Xmx)</span>
                      <span className="font-mono font-bold text-cyan-400 text-base">{adminRam} GB RAM</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="16" 
                      step="1" 
                      value={adminRam} 
                      onChange={(e) => setAdminRam(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-500 cursor-pointer" 
                    />
                    <p className="text-xs text-slate-400">
                      Recommended: 4 GB for small SMPs with 10-15 plugins; 8+ GB for custom RPG plugins like AquaFishing.
                    </p>
                  </div>

                  {/* Max Players Slider */}
                  <div className="p-6 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Max Player Slots</span>
                      <span className="font-mono font-bold text-amber-400 text-base">{adminMaxPlayers} Players</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      step="5" 
                      value={adminMaxPlayers} 
                      onChange={(e) => setAdminMaxPlayers(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer" 
                    />
                    <p className="text-xs text-slate-400">
                      Changes <code className="text-cyan-300 font-mono">max-players</code> setting in server.properties.
                    </p>
                  </div>

                  {/* Difficulty Selector */}
                  <div className="p-6 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-sm font-bold text-white block">Game Difficulty</span>
                    <div className="grid grid-cols-4 gap-2">
                      {['peaceful', 'easy', 'normal', 'hard'].map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setAdminDifficulty(d);
                            handleSendCommand(`difficulty ${d}`);
                            showToast(`Difficulty changed to ${d.toUpperCase()}`, 'success');
                          }}
                          className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                            adminDifficulty === d 
                              ? 'bg-cyan-600 text-white shadow-md' 
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Whitelist Toggle */}
                  <div className="p-6 bg-[#0b101c] rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">Server Whitelist Protection</span>
                      <p className="text-xs text-slate-400 mt-1">Only approved usernames can join the server.</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !adminWhitelist;
                        setAdminWhitelist(next);
                        handleSendCommand(`whitelist ${next ? 'on' : 'off'}`);
                        showToast(`Whitelist is now ${next ? 'ENABLED' : 'DISABLED'}`, next ? 'success' : 'warn');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        adminWhitelist ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {adminWhitelist ? 'WHITELIST ON' : 'WHITELIST OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 5: BUG HUNTER & DIAGNOSTIC STUDIO (DEV) ================= */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-gradient-to-r from-red-950/30 via-[#101726] to-[#0d1522] rounded-2xl border border-red-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Bug className="w-4 h-4" />
                      Paper Stack Trace Triage Engine
                    </div>
                    <h3 className="text-lg font-bold text-white">Automated Exception Isolation & Code Patching</h3>
                    <p className="text-xs text-slate-300 max-w-2xl mt-1">
                      Intercepts server crashes and NullPointerExceptions. Pinpoints the culprit plugin and exact source code line, generating ready-to-paste Java fixes.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerError}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <Bug className="w-4 h-4" />
                    Simulate Live Exception
                  </button>
                </div>

                <div className="space-y-4">
                  {reports.map((report) => {
                    const isExpanded = expandedReportId === report.id;

                    return (
                      <div
                        key={report.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          report.resolved 
                            ? 'bg-slate-900/40 border-slate-800 opacity-60' 
                            : 'bg-[#0d1424] border-slate-800 hover:border-slate-700 shadow-xl'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-red-950/50 border border-red-500/30 rounded-xl mt-0.5">
                              <AlertOctagon className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                                  {report.severity}
                                </span>
                                {report.culpritPlugin && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                                    Plugin: {report.culpritPlugin}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500 font-mono">
                                  {new Date(report.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200 font-mono">{report.errorType}</h4>
                              <p className="text-xs text-slate-400 line-clamp-1">{report.message}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {report.location && (
                              <span className="text-xs font-mono text-cyan-400 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
                                {report.location.fileName}:{report.location.lineNumber}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetch(`/api/diagnostics/${report.id}/resolve`, { method: 'POST' })
                                  .then(() => fetch('/api/diagnostics').then(r => r.json()).then(d => setReports(d.reports || [])));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                report.resolved ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                              }`}
                            >
                              {report.resolved ? 'Resolved' : 'Mark Fixed'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-6 border-t border-slate-800/80 bg-[#070b13] space-y-5">
                            <div className="p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                Root Cause Diagnostic
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">{report.explanation}</p>
                              <p className="text-xs text-slate-300 pt-1">
                                <span className="text-cyan-400 font-bold">Recommended Fix:</span> {report.recommendedFix}
                              </p>
                            </div>

                            {report.codeSnippet && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <Code2 className="w-4 h-4 text-emerald-400" />
                                    Suggested Java Fix ({report.location?.fileName || 'Plugin Source'})
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(report.codeSnippet!);
                                      setCopiedCodeId(report.id);
                                      setTimeout(() => setCopiedCodeId(null), 2000);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-all cursor-pointer"
                                  >
                                    {copiedCodeId === report.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedCodeId === report.id ? 'Copied!' : 'Copy Patch'}
                                  </button>
                                </div>
                                <pre className="p-4 bg-black/70 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto select-all">
                                  {report.codeSnippet}
                                </pre>
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Raw Stack Trace
                              </span>
                              <div className="p-3 bg-black/50 border border-slate-800/80 rounded-xl font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto space-y-0.5 terminal-scroll select-text">
                                {report.stackTrace.map((line, lidx) => (
                                  <div 
                                    key={lidx}
                                    className={line.includes('com.efekoc') || line.includes('Aqua') ? 'text-cyan-400 font-bold bg-cyan-950/40 px-1 rounded' : ''}
                                  >
                                    {line}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 6: PLUGINS & DYNAMIC GITHUB SYNC ================= */}
            {activeTab === 'plugins' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Plugin Vault & Multi-User GitHub Marketplace</h3>
                    <p className="text-xs text-slate-400">Inspects jars, and allows ANY user to link their GitHub to deploy their custom plugins.</p>
                  </div>
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md self-start sm:self-auto">
                    <Box className="w-3.5 h-3.5" />
                    Upload .jar
                    <input 
                      type="file" 
                      accept=".jar" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const formData = new FormData();
                          formData.append('file', e.target.files[0]);
                          fetch('/api/plugins/upload', { method: 'POST', body: formData })
                            .then(() => {
                              showToast('Uploaded plugin successfully!', 'success');
                              fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || []));
                            });
                        }
                      }}
                    />
                  </label>
                </div>

                {/* DYNAMIC GITHUB ACCOUNT / USER INPUT */}
                <div className="p-5 bg-gradient-to-r from-blue-950/30 via-[#0d1626] to-[#0d1424] rounded-2xl border border-cyan-800/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                      <Github className="w-4 h-4 text-cyan-400" />
                      Sync Plugins from GitHub Account
                    </div>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        fetchGithubUserRepos(githubUser);
                      }} 
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={githubUser}
                        onChange={(e) => setGithubUser(e.target.value)}
                        placeholder="Enter GitHub username (e.g. efekkoc, lucko)..."
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 w-52"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                      >
                        Fetch Repos
                      </button>
                    </form>
                  </div>

                  {/* Fetched GitHub Repos for this user */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {loadingRepos ? (
                      <p className="text-xs text-slate-400 italic">Fetching GitHub repositories for {githubUser}...</p>
                    ) : userRepos.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No repositories found for @{githubUser}. Try another username.</p>
                    ) : (
                      userRepos.map((repo) => (
                        <div key={repo.name} className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                          <div className="overflow-hidden">
                            <span className="font-bold text-xs text-slate-200 block truncate">{repo.name}</span>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{repo.description || 'Minecraft repository'}</p>
                          </div>
                          <button
                            onClick={() => handleDeployGithubRelease(repo.name)}
                            disabled={installingRepo === repo.name}
                            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-700/80 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            <Download className="w-3 h-3" />
                            {installingRepo === repo.name ? 'Deploying...' : 'Deploy'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Installed Plugins Grid */}
                <div className="flex items-center justify-between pt-2">
                  <h4 className="text-sm font-bold text-slate-200">
                    Currently Installed in server/plugins/ ({plugins.length})
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Exact Disk Size Auto-Calculated
                  </span>
                </div>

                {plugins.length === 0 ? (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 bg-[#0d1424]/60 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                    <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                      <Box className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-base font-bold text-white">No Plugins Installed</h5>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Your server plugins directory is completely clean. AquaForge will not inject dummy or unrequested jars. Upload your custom plugin jar or discover plugins via GitHub/Modrinth.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all">
                      <Upload className="w-4 h-4" />
                      Upload Plugin (.jar)
                      <input type="file" accept=".jar" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plugins.map((plugin) => (
                      <div 
                        key={plugin.fileName}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          plugin.enabled ? 'bg-[#0d1424] border-slate-800' : 'bg-slate-950/50 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                {plugin.name}
                                {plugin.name.includes('Aqua') && (
                                  <span className="p-0.5 rounded bg-cyan-950 text-cyan-400" title="Created by efekkoc">
                                    <Sparkles className="w-3 h-3" />
                                  </span>
                                )}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400">v{plugin.version} • API {plugin.apiVersion}</span>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              plugin.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {plugin.enabled ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{plugin.description}</p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                            {formatFileSize(plugin.fileSizeBytes)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTogglePlugin(plugin.fileName)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="Toggle Enable / Disable"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                fetch(`/api/plugins/${plugin.fileName}`, { method: 'DELETE' })
                                  .then(() => fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || [])));
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 cursor-pointer"
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
              </div>
            )}

            {/* ================= TAB 7: DEVSYNC HOT-SWAP (DEV) ================= */}
            {activeTab === 'devsync' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Chokidar Dev-Sync & Hot-Swap Engine
                  </div>
                  <h3 className="text-base font-bold text-white">Automate ./gradlew build Hot-Reloads</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Watches your local plugin project build directory. Whenever a new jar is generated by Gradle or Maven on your Mac, it is immediately synced to the server plugins folder without restarting!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Add Watcher Form */}
                  <form onSubmit={handleAddWatcher} className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Register Watch Folder</h4>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Project Name</label>
                      <input
                        type="text"
                        value={newWatcherName}
                        onChange={(e) => setNewWatcherName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Local Build Dir</label>
                      <input
                        type="text"
                        value={newWatcherDir}
                        onChange={(e) => setNewWatcherDir(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Target JAR Name</label>
                      <input
                        type="text"
                        value={newWatcherTarget}
                        onChange={(e) => setNewWatcherTarget(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Start Monitoring Folder
                    </button>
                  </form>

                  {/* Active Watchers List */}
                  <div className="lg:col-span-2 p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Watchers ({watchers.length})</h4>
                    {watchers.map((w) => (
                      <div key={w.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-white">{w.name}</span>
                          <p className="text-slate-400 font-mono text-[11px]">{w.sourceDirectory} &rarr; {w.targetPluginName}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          HOT-SWAP LISTENING
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 8: YAML CONFIG STUDIO (DEV) ================= */}
            {activeTab === 'config' && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">YAML Config Studio & Linter</h3>
                    <p className="text-xs text-slate-400">Prevents server crash from illegal tab indentation before rebooting.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        fetch('/api/configs/fix-indentation', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: configContent })
                        })
                          .then(r => r.json())
                          .then(d => {
                            setConfigContent(d.content);
                            showToast('Converted tabs to 2 spaces!', 'success');
                          });
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 inline mr-1" />
                      Fix Indentation
                    </button>
                    <button
                      onClick={() => {
                        fetch('/api/configs/save', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: selectedConfigPath, content: configContent })
                        })
                          .then(r => r.json())
                          .then(d => showToast(d.message, 'success'));
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 inline mr-1" />
                      Save & Backup
                    </button>
                  </div>
                </div>

                <textarea
                  value={configContent}
                  onChange={(e) => setConfigContent(e.target.value)}
                  spellCheck={false}
                  className="w-full min-h-[500px] p-5 bg-[#05080e] rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none leading-relaxed terminal-scroll select-text"
                />
              </div>
            )}

            {/* ================= TAB 9: RESOURCE PACKS ================= */}
            {activeTab === 'resourcepack' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <PackageOpen className="w-4 h-4" />
                    Resource Pack CDN & SHA-1 Sync
                  </div>
                  <h3 className="text-base font-bold text-white">Built for Custom Textures & Models (AquaFishing)</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Computes cryptographic SHA-1 hashes and automatically sets the download URL in <code className="text-cyan-300 font-mono">server.properties</code> so players prompt-download textures upon joining.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packs.map((pack) => (
                    <div key={pack.id} className="p-5 bg-[#0d1424] rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{pack.fileName}</span>
                        {pack.isApplied && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                            ACTIVE IN SERVER.PROPERTIES
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-slate-800 break-all">
                        SHA-1: {pack.sha1}
                      </p>
                      <button
                        onClick={() => {
                          fetch('/api/resourcepacks/apply', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileName: pack.fileName })
                          })
                            .then(r => r.json())
                            .then(d => {
                              showToast(d.message, 'success');
                              fetch('/api/resourcepacks').then(r => r.json()).then(res => setPacks(res.packs || []));
                            });
                        }}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                      >
                        1-Click Apply to server.properties
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB: AQUA SUITE & PRESETS HUB ================= */}
            {activeTab === 'suite' && (
              <AquaSuiteHubView
                onDeployPreset={handleDeployPreset}
                installedPluginIds={plugins.map(p => p.name.toLowerCase())}
              />
            )}

            {/* ================= TAB: GLOBAL PLAY TUNNEL ================= */}
            {activeTab === 'tunnel' && (
              <GlobalConnectTunnelView serverStatus={status} />
            )}

            {/* ================= TAB: WORLD VAULT & SEEDS ================= */}
            {activeTab === 'world' && (
              <WorldVaultView onSendCommand={handleSendCommand} />
            )}

            {/* ================= TAB: AQUAMAP LIVE RADAR ================= */}
            {activeTab === 'map' && (
              <AquaMapRadarView serverStatus={status} />
            )}

            {/* ================= TAB: VISUAL SERVER.PROPERTIES TWEAK STUDIO ================= */}
            {activeTab === 'properties' && (
              <VisualPropertiesView showToast={showToast} />
            )}

            {/* ================= TAB: 1-CLICK BACKUP VAULT ================= */}
            {activeTab === 'backups' && (
              <BackupVaultView showToast={showToast} formatFileSize={formatFileSize} />
            )}

            {/* ================= TAB: DISCORD WEBHOOK ALERT BRIDGE ================= */}
            {activeTab === 'discord' && (
              <DiscordBridgeView showToast={showToast} />
            )}

            {/* ================= TAB: PLUGIN DEPENDENCY CONFLICT MATRIX ================= */}
            {activeTab === 'dependencies' && (
              <DependencyMatrixView
                plugins={plugins}
                showToast={showToast}
                onRefreshPlugins={() => fetch('/api/plugins').then(r => r.json()).then(d => setPlugins(d.plugins || []))}
              />
            )}

          </main>
        </div>
      </div>

      {/* ================= INTERACTIVE GUIDE & INFO MODAL ================= */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1220] border border-[#1b273d] w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] terminal-scroll">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AquaForge Quick Start & Documentation</h3>
                  <p className="text-xs text-slate-400">Next-Gen Minecraft Server Orchestrator & Bug Hunter</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Attribution Card */}
            <div className="p-4 bg-gradient-to-r from-blue-950/40 to-cyan-950/40 rounded-xl border border-cyan-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300">Creator & Lead Architect:</p>
                <h4 className="text-sm font-bold text-white">Turgut Efekan Koç (efekkoc)</h4>
                <p className="text-[11px] text-cyan-300">Paper / Spigot / JVM Plugin Engineer</p>
              </div>
              <a
                href="https://github.com/efekkoc"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub Profile
              </a>
            </div>

            {/* Step by Step Guide */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-wide">How to Use This Platform:</h4>
              
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white">1. Starting a Server (Local or Simulation)</span>
                <p className="text-slate-400">
                  Click the green <b>"Start Server"</b> button at the top right. If you place a real <code>paper.jar</code> in <code>server/server_data/</code>, AquaForge boots your real process. If not, it safely initializes an intelligent simulation environment so you can test all features offline.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white">2. Admin Mode vs Developer Mode</span>
                <p className="text-slate-400">
                  Use the top-right toggle: <b>Admin Mode</b> gives server owners a clean dashboard with 1-click lag clearing, live players list, and difficulty sliders. <b>Developer Mode</b> unlocks Bug Hunter, raw terminal logs, and Gradle watch daemons.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white">3. Bug Hunter & Stack Trace Triage</span>
                <p className="text-slate-400">
                  When a plugin crashes, Bug Hunter intercepts the log, finds the failing class and line number, and writes a production-ready Java code fix. Try the <b>"Trigger Test Error"</b> button in the console!
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white">4. Syncing Plugins from Any GitHub Account</span>
                <p className="text-slate-400">
                  Open the <b>Vault & GitHub Repos</b> tab. You can type ANY GitHub username (such as your own username) to fetch public plugin releases and deploy them with 1-click.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white">5. 1-Click Launch on macOS & Windows</span>
                <p className="text-slate-400">
                  Anyone cloning this repo from GitHub can simply run <code>./start.sh</code> on Mac/Linux or <code>start.bat</code> on Windows to launch everything automatically!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Got It!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 1-CLICK SERVER WIZARD MODAL ================= */}
      <ServerWizardModal
        isOpen={showServerWizard}
        onClose={() => setShowServerWizard(false)}
        onCompleteLaunch={(config) => {
          setMcVersion(config.version);
          handleDeployPreset(config.selectedPlugins);
          showToast(`🚀 Server ${config.serverName} launched with ${config.selectedPlugins.length} Aqua plugins!`, 'success');
          if (status === 'OFFLINE') {
            handleServerAction('start');
          }
          setActiveTab('overview');
        }}
      />

    </div>
  );
};
