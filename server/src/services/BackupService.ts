import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { BackupArchive } from '../types.js';

export class BackupService {
  private baseDir: string;
  private backupsDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.backupsDir = path.join(baseDir, 'backups');
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  public listBackups(): BackupArchive[] {
    if (!fs.existsSync(this.backupsDir)) return [];
    const files = fs.readdirSync(this.backupsDir);
    const list: BackupArchive[] = [];

    for (const file of files) {
      if (!file.endsWith('.zip')) continue;
      const filePath = path.join(this.backupsDir, file);
      const stat = fs.statSync(filePath);
      let type: 'FULL' | 'WORLD' | 'PLUGINS' = 'FULL';
      if (file.includes('world')) type = 'WORLD';
      else if (file.includes('plugins')) type = 'PLUGINS';

      list.push({
        id: file,
        fileName: file,
        sizeBytes: stat.size,
        createdAt: stat.mtime.toISOString(),
        type
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createBackup(type: 'FULL' | 'WORLD' | 'PLUGINS' = 'FULL'): Promise<BackupArchive> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `AquaForge-Backup-${type.toLowerCase()}-${timestamp}.zip`;
    const outputPath = path.join(this.backupsDir, fileName);

    const zip = new AdmZip();

    if (type === 'FULL' || type === 'PLUGINS') {
      const pluginsPath = path.join(this.baseDir, 'plugins');
      if (fs.existsSync(pluginsPath)) {
        zip.addLocalFolder(pluginsPath, 'plugins');
      }
    }

    if (type === 'FULL' || type === 'WORLD') {
      const worldPath = path.join(this.baseDir, 'world');
      if (fs.existsSync(worldPath)) {
        zip.addLocalFolder(worldPath, 'world');
      }
    }

    // Always include properties and server config
    const propsPath = path.join(this.baseDir, 'server.properties');
    if (fs.existsSync(propsPath)) {
      zip.addLocalFile(propsPath, '');
    }

    await zip.writeZipPromise(outputPath);

    const stat = fs.statSync(outputPath);
    return {
      id: fileName,
      fileName,
      sizeBytes: stat.size,
      createdAt: stat.mtime.toISOString(),
      type
    };
  }

  public deleteBackup(fileName: string): boolean {
    const target = path.join(this.backupsDir, path.basename(fileName));
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      return true;
    }
    return false;
  }

  public restoreBackup(fileName: string): { success: boolean; message: string } {
    const target = path.join(this.backupsDir, path.basename(fileName));
    if (!fs.existsSync(target)) {
      return { success: false, message: 'Backup file does not exist' };
    }

    try {
      const zip = new AdmZip(target);
      zip.extractAllTo(this.baseDir, true);
      return { success: true, message: `Successfully restored ${fileName}` };
    } catch (err: any) {
      return { success: false, message: `Restore error: ${err.message}` };
    }
  }

  public getBackupPath(fileName: string): string | null {
    const target = path.join(this.backupsDir, path.basename(fileName));
    return fs.existsSync(target) ? target : null;
  }
}
