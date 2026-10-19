import fs from 'fs';
import path from 'path';
import { DiscordWebhookConfig, DiagnosticReport } from '../types.js';

export class DiscordWebhookService {
  private configPath: string;
  private config: DiscordWebhookConfig;

  constructor(baseDir: string) {
    this.configPath = path.join(baseDir, 'discord_webhook.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): DiscordWebhookConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch {
        // fallback
      }
    }
    return {
      enabled: false,
      url: '',
      serverName: 'AquaForge Production Server',
      notifyOnStart: true,
      notifyOnStop: true,
      notifyOnCrash: true,
      notifyOnLowTps: false
    };
  }

  public getConfig(): DiscordWebhookConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<DiscordWebhookConfig>): DiscordWebhookConfig {
    this.config = { ...this.config, ...newConfig };
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    return this.config;
  }

  public async sendTestWebhook(): Promise<{ success: boolean; message: string }> {
    if (!this.config.url) {
      return { success: false, message: 'Webhook URL is not configured' };
    }

    const payload = {
      username: 'AquaForge Studio Bot',
      avatar_url: 'https://raw.githubusercontent.com/efekkoc/aquaforge/main/client/public/logo.png',
      embeds: [
        {
          title: '✅ Discord Webhook Connected Successfully',
          description: `AquaForge Studio is now linked to **${this.config.serverName}**. You will receive real-time crash triage and server telemetry alerts.`,
          color: 0x06b6d4, // Cyan
          fields: [
            { name: 'Studio Version', value: 'AquaForge v2.4.0 Global', inline: true },
            { name: 'Author', value: 'Turgut Efekan Koç (efekkoc)', inline: true },
            { name: 'Status', value: '🟢 Monitoring Active', inline: true }
          ],
          footer: { text: 'AquaForge Universal Minecraft Studio' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    return this.postPayload(payload);
  }

  public async notifyServerStatus(status: 'ONLINE' | 'STOPPING' | 'CRASHED'): Promise<void> {
    if (!this.config.enabled || !this.config.url) return;

    if (status === 'ONLINE' && !this.config.notifyOnStart) return;
    if (status === 'STOPPING' && !this.config.notifyOnStop) return;

    const isOnline = status === 'ONLINE';
    const payload = {
      username: 'AquaForge Alert',
      embeds: [
        {
          title: isOnline ? '🟢 Server Online' : '🔴 Server Offline',
          description: `Server **${this.config.serverName}** is now **${status}**.`,
          color: isOnline ? 0x10b981 : 0xef4444,
          timestamp: new Date().toISOString()
        }
      ]
    };

    await this.postPayload(payload);
  }

  public async notifyCrash(report: DiagnosticReport): Promise<void> {
    if (!this.config.enabled || !this.config.url || !this.config.notifyOnCrash) return;

    const payload = {
      username: 'AquaForge Crash Hunter',
      embeds: [
        {
          title: `🚨 Server Exception Detected: ${report.errorType}`,
          description: report.message,
          color: 0xdc2626, // Red
          fields: [
            { name: 'Culprit Plugin', value: report.culpritPlugin || 'Unknown Core', inline: true },
            { name: 'Location', value: report.location ? `${report.location.fileName}:${report.location.lineNumber}` : 'N/A', inline: true },
            { name: 'Severity', value: report.severity, inline: true },
            { name: 'Recommended Fix', value: report.recommendedFix }
          ],
          footer: { text: 'AquaForge Automated Diagnostics' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    await this.postPayload(payload);
  }

  private async postPayload(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(this.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok || res.status === 204) {
        return { success: true, message: 'Discord webhook dispatched successfully' };
      }
      return { success: false, message: `Discord returned HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, message: `Webhook error: ${err.message}` };
    }
  }
}
