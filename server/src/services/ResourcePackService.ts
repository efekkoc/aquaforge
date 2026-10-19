import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ResourcePackItem } from '../types.js';

export class ResourcePackService {
  private packsDir: string;
  private serverPropertiesPath: string;

  constructor(packsDir: string, serverPropertiesPath: string) {
    this.packsDir = packsDir;
    this.serverPropertiesPath = serverPropertiesPath;
    this.ensureDirectory();
    this.seedSampleResourcePack();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.packsDir)) {
      fs.mkdirSync(this.packsDir, { recursive: true });
    }
  }

  public getResourcePacks(baseUrl: string): ResourcePackItem[] {
    this.ensureDirectory();
    const files = fs.readdirSync(this.packsDir);
    const appliedPack = this.getCurrentAppliedPack();

    const items: ResourcePackItem[] = [];
    for (const file of files) {
      if (!file.endsWith('.zip')) continue;

      const fullPath = path.join(this.packsDir, file);
      const stats = fs.statSync(fullPath);
      const sha1 = this.calculateSha1(fullPath);
      const downloadUrl = `${baseUrl}/api/resourcepacks/download/${encodeURIComponent(file)}`;

      items.push({
        id: sha1.substring(0, 8),
        fileName: file,
        sha1,
        sizeBytes: stats.size,
        uploadedAt: stats.mtime.toISOString(),
        downloadUrl,
        isApplied: appliedPack?.sha1.toLowerCase() === sha1.toLowerCase()
      });
    }

    return items;
  }

  public calculateSha1(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha1').update(fileBuffer).digest('hex');
  }

  public applyToProperties(packFileName: string, baseUrl: string): { success: boolean; message: string } {
    const fullPath = path.join(this.packsDir, packFileName);
    if (!fs.existsSync(fullPath)) {
      return { success: false, message: 'Resource pack file not found' };
    }

    const sha1 = this.calculateSha1(fullPath);
    const downloadUrl = `${baseUrl}/api/resourcepacks/download/${encodeURIComponent(packFileName)}`;

    if (!fs.existsSync(this.serverPropertiesPath)) {
      return { success: false, message: 'server.properties not found' };
    }

    let props = fs.readFileSync(this.serverPropertiesPath, 'utf8');

    // Update resource-pack
    if (props.includes('resource-pack=')) {
      props = props.replace(/resource-pack=.*(\r?\n)/, `resource-pack=${downloadUrl}$1`);
    } else {
      props += `\nresource-pack=${downloadUrl}`;
    }

    // Update resource-pack-sha1
    if (props.includes('resource-pack-sha1=')) {
      props = props.replace(/resource-pack-sha1=.*(\r?\n)/, `resource-pack-sha1=${sha1}$1`);
    } else {
      props += `\nresource-pack-sha1=${sha1}`;
    }

    fs.writeFileSync(this.serverPropertiesPath, props, 'utf8');
    return { success: true, message: `Successfully synced ${packFileName} (SHA-1: ${sha1}) to server.properties!` };
  }

  public getCurrentAppliedPack(): { url: string; sha1: string } | null {
    if (!fs.existsSync(this.serverPropertiesPath)) return null;
    const props = fs.readFileSync(this.serverPropertiesPath, 'utf8');
    const urlMatch = props.match(/resource-pack=([^\r\n]*)/);
    const sha1Match = props.match(/resource-pack-sha1=([^\r\n]*)/);

    return {
      url: urlMatch ? urlMatch[1] : '',
      sha1: sha1Match ? sha1Match[1] : ''
    };
  }

  public getPackFilePath(fileName: string): string | null {
    const p = path.join(this.packsDir, fileName);
    return fs.existsSync(p) ? p : null;
  }

  private seedSampleResourcePack() {
    const samplePack = path.join(this.packsDir, 'AquaFishing-Pack-v1.2.zip');
    if (!fs.existsSync(samplePack)) {
      // Create lightweight sample zip
      fs.writeFileSync(samplePack, Buffer.from('PK\x03\x04MOCK_AQUAFISHING_TEXTURES_AND_MODELS'));
    }
  }
}
