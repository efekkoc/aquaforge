import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import yaml from 'js-yaml';
import { PluginMeta } from '../types.js';

export class PluginManager {
  private pluginsDir: string;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.ensureDirectory();
    this.seedSamplePlugins();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  public getPlugins(): PluginMeta[] {
    this.ensureDirectory();
    const files = fs.readdirSync(this.pluginsDir);
    const plugins: PluginMeta[] = [];

    for (const file of files) {
      if (!file.endsWith('.jar') && !file.endsWith('.jar.disabled')) {
        continue;
      }

      const filePath = path.join(this.pluginsDir, file);
      const isEnabled = file.endsWith('.jar');
      const stats = fs.statSync(filePath);

      let meta: Partial<PluginMeta> = {};
      try {
        meta = this.extractPluginYml(filePath);
      } catch (err) {
        // Fallback for mock or corrupt jars
        const baseName = file.replace(/\.jar(\.disabled)?$/, '');
        meta = {
          name: baseName,
          version: '1.0.0',
          authors: ['efekkoc'],
          description: 'AquaForge Managed Minecraft Plugin',
          depends: [],
          softDepends: []
        };
      }

      plugins.push({
        fileName: file,
        name: meta.name || file.replace(/\.jar(\.disabled)?$/, ''),
        version: meta.version || '1.0.0',
        mainClass: meta.mainClass,
        apiVersion: meta.apiVersion || '1.21',
        authors: meta.authors || ['efekkoc'],
        description: meta.description || 'Minecraft Paper/Spigot Plugin',
        website: meta.website,
        depends: meta.depends || [],
        softDepends: meta.softDepends || [],
        enabled: isEnabled,
        fileSizeBytes: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        source: meta.name?.toLowerCase().includes('aqua') ? 'GITHUB' : 'LOCAL'
      });
    }

    return plugins;
  }

  public togglePlugin(fileName: string): { success: boolean; newFileName?: string; error?: string } {
    const isCurrentlyEnabled = fileName.endsWith('.jar');
    const oldPath = path.join(this.pluginsDir, fileName);

    if (!fs.existsSync(oldPath)) {
      return { success: false, error: 'Plugin file not found' };
    }

    const newFileName = isCurrentlyEnabled ? `${fileName}.disabled` : fileName.replace(/\.disabled$/, '');
    const newPath = path.join(this.pluginsDir, newFileName);

    try {
      fs.renameSync(oldPath, newPath);
      return { success: true, newFileName };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public deletePlugin(fileName: string): { success: boolean; error?: string } {
    const targetPath = path.join(this.pluginsDir, fileName);
    if (!fs.existsSync(targetPath)) {
      return { success: false, error: 'File does not exist' };
    }
    try {
      fs.unlinkSync(targetPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  private extractPluginYml(jarPath: string): Partial<PluginMeta> {
    const zip = new AdmZip(jarPath);
    let ymlEntry = zip.getEntry('plugin.yml');
    if (!ymlEntry) {
      ymlEntry = zip.getEntry('paper-plugin.yml');
    }

    if (!ymlEntry) {
      throw new Error('No plugin.yml or paper-plugin.yml found');
    }

    const content = zip.readAsText(ymlEntry);
    const parsed: any = yaml.load(content);

    return {
      name: parsed.name,
      version: String(parsed.version || '1.0.0'),
      mainClass: parsed.main,
      apiVersion: parsed['api-version'],
      authors: Array.isArray(parsed.authors) ? parsed.authors : parsed.author ? [parsed.author] : [],
      description: parsed.description,
      website: parsed.website,
      depends: Array.isArray(parsed.depend) ? parsed.depend : [],
      softDepends: Array.isArray(parsed.softdepend) ? parsed.softdepend : []
    };
  }

  private seedSamplePlugins() {
    const sampleFiles = [
      {
        fileName: 'AquaFishing-1.0.0.jar',
        yml: `name: AquaFishing\nversion: 1.0.0\nmain: com.efekoc.aquafishing.AquaFishing\napi-version: '1.21'\nauthor: efekkoc\ndescription: Advanced RPG Fishing plugin with 40 custom fish, reeling mini-game, and bossbars.\ndepend: [Vault]\nsoftdepend: [AquaMap, Spark]`
      },
      {
        fileName: 'AquaMap-1.2.0.jar',
        yml: `name: AquaMap\nversion: 1.2.0\nmain: com.efekoc.aquamap.AquaMap\napi-version: '1.21'\nauthor: efekkoc\ndescription: Clientless live minimap, player radar, and HUD compass plugin for Paper 1.21.`
      },
      {
        fileName: 'LuckPerms-5.4.102.jar',
        yml: `name: LuckPerms\nversion: 5.4.102\nmain: me.lucko.luckperms.bukkit.loader.BukkitLoaderPlugin\napi-version: '1.13'\nauthor: Luck\ndescription: An advanced permissions plugin for Minecraft servers.`
      },
      {
        fileName: 'Vault-1.7.3.jar',
        yml: `name: Vault\nversion: 1.7.3\nmain: net.milkbowl.vault.Vault\nauthor: Sleaker\ndescription: Vault is a Permissions & Economy API to allow plugins to easily hook into economy systems.`
      },
      {
        fileName: 'Spark-1.10.53.jar',
        yml: `name: spark\nversion: 1.10.53\nmain: me.lucko.spark.bukkit.SparkBukkitPlugin\nauthor: Luck\ndescription: Performance profiler and diagnostic tool for Minecraft clients and servers.`
      }
    ];

    for (const sample of sampleFiles) {
      const filePath = path.join(this.pluginsDir, sample.fileName);
      if (!fs.existsSync(filePath)) {
        try {
          const zip = new AdmZip();
          zip.addFile('plugin.yml', Buffer.from(sample.yml, 'utf8'));
          zip.writeZip(filePath);
        } catch (err) {
          // If zip creation fails, write dummy file
          fs.writeFileSync(filePath, Buffer.from('MOCK_JAR_BYTES'));
        }
      }
    }
  }
}
