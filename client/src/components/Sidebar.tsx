import React from 'react';
import { LayoutDashboard, Terminal, Bug, Box, RefreshCw, FileCode, PackageOpen } from 'lucide-react';

export type TabId = 'dashboard' | 'console' | 'diagnostics' | 'plugins' | 'devsync' | 'configs' | 'resourcepacks';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  unresolvedErrorsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unresolvedErrorsCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabId,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'console' as TabId,
      label: 'Live Terminal',
      icon: Terminal,
      badge: null
    },
    {
      id: 'diagnostics' as TabId,
      label: 'Bug Hunter',
      icon: Bug,
      badge: unresolvedErrorsCount > 0 ? `${unresolvedErrorsCount}` : null,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'plugins' as TabId,
      label: 'Plugin Vault',
      icon: Box,
      badge: null
    },
    {
      id: 'devsync' as TabId,
      label: 'Dev-Sync & Hot-Swap',
      icon: RefreshCw,
      badge: 'PRO'
    },
    {
      id: 'configs' as TabId,
      label: 'Config Inspector',
      icon: FileCode,
      badge: null
    },
    {
      id: 'resourcepacks' as TabId,
      label: 'Resource Pack Hub',
      icon: PackageOpen,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f19] flex flex-col justify-between py-6 px-3 select-none">
      <div className="space-y-1.5">
        <div className="px-3 pb-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Management & Dev
          </p>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border border-cyan-800/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </div>

              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    tab.badgeColor || 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Developer Profile Card */}
      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
            EK
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">efekkoc</p>
            <p className="text-[10px] text-slate-400 truncate">Paper / Spigot Architect</p>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>AquaFishing</span>
          <span className="text-emerald-400 font-mono text-[10px]">v1.0.0</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>AquaMap</span>
          <span className="text-emerald-400 font-mono text-[10px]">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
