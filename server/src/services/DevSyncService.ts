import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { DevSyncWatcher } from '../types.js';

export class DevSyncService {
  private watchers: Map<string, { config: DevSyncWatcher; watcher: chokidar.FSWatcher }> = new Map();
  private pluginsDir: string;
  private onSyncCallback?: (watcher: DevSyncWatcher, fileName: string) => void;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  public setOnSyncCallback(cb: (watcher: DevSyncWatcher, fileName: string) => void) {
    this.onSyncCallback = cb;
  }

  public getWatchers(): DevSyncWatcher[] {
    return Array.from(this.watchers.values()).map(w => w.config);
  }

  public addWatcher(config: DevSyncWatcher): { success: boolean; message: string } {
    if (this.watchers.has(config.id)) {
      this.removeWatcher(config.id);
    }

    if (!fs.existsSync(config.sourceDirectory)) {
      // Create folder if it doesn't exist for convenience
      try {
        fs.mkdirSync(config.sourceDirectory, { recursive: true });
      } catch (err: any) {
        return { success: false, message: `Invalid source directory: ${err.message}` };
      }
    }

    const fsWatcher = chokidar.watch(config.sourceDirectory, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      depth: 2
    });

    fsWatcher.on('all', (event, filePath) => {
      if ((event === 'add' || event === 'change') && filePath.endsWith('.jar') && !filePath.includes('-sources') && !filePath.includes('-javadoc')) {
        this.handleFileChange(config, filePath);
      }
    });

    this.watchers.set(config.id, { config, watcher: fsWatcher });
    return { success: true, message: `Watcher active for ${config.name}` };
  }

  public removeWatcher(id: string): boolean {
    const entry = this.watchers.get(id);
    if (entry) {
      entry.watcher.close();
      this.watchers.delete(id);
      return true;
    }
    return false;
  }

  public toggleWatcher(id: string): boolean {
    const entry = this.watchers.get(id);
    if (entry) {
      entry.config.active = !entry.config.active;
      return true;
    }
    return false;
  }

  private handleFileChange(config: DevSyncWatcher, sourceFilePath: string) {
    if (!config.active) return;

    try {
      const fileName = path.basename(sourceFilePath);
      const destination = path.join(this.pluginsDir, fileName);

      fs.copyFileSync(sourceFilePath, destination);
      config.lastSyncAt = new Date().toISOString();

      if (this.onSyncCallback) {
        this.onSyncCallback(config, fileName);
      }
    } catch (err) {
      console.error(`[DevSync] Failed to hot-copy ${sourceFilePath}:`, err);
    }
  }
}
