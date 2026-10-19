import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Check, AlertTriangle, ShieldAlert, Sparkles, 
  ExternalLink, MessageSquare, Save, CheckCircle2
} from 'lucide-react';
import { DiscordWebhookConfig } from '../types';

interface DiscordBridgeViewProps {
  showToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const DiscordBridgeView: React.FC<DiscordBridgeViewProps> = ({ showToast }) => {
  const [config, setConfig] = useState<DiscordWebhookConfig>({
    enabled: false,
    url: '',
    serverName: 'AquaForge Production Server',
    notifyOnStart: true,
    notifyOnStop: true,
    notifyOnCrash: true,
    notifyOnLowTps: false
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/discord/config')
      .then(r => r.json())
      .then(d => {
        if (d) setConfig(d);
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setSaving(true);
    fetch('/api/discord/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
      .then(r => r.json())
      .then(d => {
        setSaving(false);
        if (d.success) {
          showToast('Discord Webhook configuration saved!', 'success');
        } else {
          showToast('Failed to save Discord config', 'error');
        }
      })
      .catch(() => {
        setSaving(false);
        showToast('Error saving Discord config', 'error');
      });
  };

  const handleTest = () => {
    if (!config.url) {
      showToast('Please enter a Discord Webhook URL first', 'warn');
      return;
    }
    setTesting(true);
    fetch('/api/discord/test', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setTesting(false);
        if (d.success) {
          showToast('Test embed sent to Discord channel!', 'success');
        } else {
          showToast(`Discord error: ${d.message}`, 'error');
        }
      })
      .catch(() => {
        setTesting(false);
        showToast('Failed to send test webhook', 'error');
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            Discord Webhook & Live Incident Alert Bridge
          </div>
          <h3 className="text-lg font-black text-white">
            Automated Rich Embed Notifications for Server Owners
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Dispatches instant alerts directly to your team's Discord channel when the server crashes, 
            detects a NullPointerException in plugins, or goes online/offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTest}
            disabled={testing || !config.url}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-cyan-400" />
            {testing ? 'Sending...' : 'Test Webhook'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Webhook Settings Form (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Discord Webhook URL
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Obtain from Discord Channel Settings &gt; Integrations &gt; Webhooks &gt; New Webhook.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Server Display Name
              </label>
              <input
                type="text"
                value={config.serverName}
                onChange={(e) => setConfig({ ...config, serverName: e.target.value })}
                placeholder="My Minecraft Server"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Event Notification Triggers
              </h5>

              <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Master Webhook Switch</span>
                  <span className="text-[10px] text-slate-400">Enable or disable all outbound alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-red-400 block">🚨 Critical Crash & Exception Alert</span>
                  <span className="text-[10px] text-slate-400">Sends culprit plugin, error type, and line number when exception occurs</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyOnCrash}
                  onChange={(e) => setConfig({ ...config, notifyOnCrash: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">🟢 Server Lifecycle (Online / Offline)</span>
                  <span className="text-[10px] text-slate-400">Notifies when server launches or shuts down</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyOnStart}
                  onChange={(e) => setConfig({ ...config, notifyOnStart: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Discord Preview Card (1 col) */}
        <div className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Discord Embed Preview
          </h4>

          {/* Mock Discord Message */}
          <div className="p-4 bg-[#2b2d31] rounded-xl space-y-2 text-xs font-sans shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
                AQ
              </div>
              <span className="font-bold text-white text-xs">AquaForge Alert</span>
              <span className="text-[9px] px-1 rounded bg-[#5865f2] text-white">BOT</span>
            </div>

            {/* Embedded Card */}
            <div className="p-3 bg-[#1e1f22] rounded-lg border-l-4 border-red-500 space-y-2">
              <span className="text-xs font-bold text-white block">
                🚨 Server Exception Detected: NullPointerException
              </span>
              <p className="text-[11px] text-slate-300">
                Cannot invoke "getHookedEntity()" because the return value is null.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block">Culprit:</span>
                  <span className="text-cyan-400 font-bold">AquaFishing</span>
                </div>
                <div>
                  <span className="text-slate-400 block">File & Line:</span>
                  <span className="text-slate-200">PlayerFishListener:84</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-900/40 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-cyan-300 block">Instant Triage Support</span>
            <p>Team members on Discord can diagnose the exact line and culprit plugin without accessing the console.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
