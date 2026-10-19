import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ServerConfig, ServerMetrics, ServerStatus } from '../types.js';
import { DiagnosticEngine } from './DiagnosticEngine.js';

export class ServerProcessManager {
  private serverProcess: ChildProcess | null = null;
  private status: ServerStatus = 'OFFLINE';
  private serverDir: string;
  private config: ServerConfig;
  private logHistory: string[] = [];
  private metrics: ServerMetrics;
  private metricsInterval: NodeJS.Timeout | null = null;
  private isSimulationMode: boolean = false;
  private diagnosticEngine: DiagnosticEngine;
  private onLogCallback?: (line: string) => void;
  private onMetricsCallback?: (metrics: ServerMetrics) => void;
  private onStatusChangeCallback?: (status: ServerStatus) => void;
  private simStep = 0;

  constructor(serverDir: string, diagnosticEngine: DiagnosticEngine) {
    this.serverDir = serverDir;
    this.diagnosticEngine = diagnosticEngine;
    this.config = {
      name: 'AquaForge-Dev-Server',
      serverJar: 'paper.jar',
      minMemory: '2G',
      maxMemory: '4G',
      javaArgs: ['-XX:+UseG1GC', '-XX:+ParallelRefProcEnabled'],
      javaPath: 'java',
      port: 25565,
      autoRestartOnCrash: false
    };

    this.metrics = {
      tps: 0.0,
      mspt: 0.0,
      memoryUsedMB: 0,
      memoryMaxMB: 4096,
      cpuPercent: 0.0,
      onlinePlayers: 0,
      maxPlayers: 50,
      uptimeSeconds: 0
    };
  }

  public setCallbacks(callbacks: {
    onLog?: (line: string) => void;
    onMetrics?: (metrics: ServerMetrics) => void;
    onStatusChange?: (status: ServerStatus) => void;
  }) {
    this.onLogCallback = callbacks.onLog;
    this.onMetricsCallback = callbacks.onMetrics;
    this.onStatusChangeCallback = callbacks.onStatusChange;
  }

  public getStatus(): ServerStatus {
    return this.status;
  }

  public getMetrics(): ServerMetrics {
    return this.metrics;
  }

  public getConfig(): ServerConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<ServerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogHistory(): string[] {
    return this.logHistory;
  }

  public startServer(): { success: boolean; message: string } {
    if (this.status === 'ONLINE' || this.status === 'STARTING') {
      return { success: false, message: 'Server is already running or starting.' };
    }

    this.setStatus('STARTING');
    this.logHistory = [];
    this.appendLog('\x1b[36m[AquaForge]\x1b[0m Initializing Minecraft Server Orchestrator...');

    const jarPath = path.join(this.serverDir, this.config.serverJar);
    const hasJar = fs.existsSync(jarPath);

    if (hasJar) {
      this.isSimulationMode = false;
      return this.spawnRealServer(jarPath);
    } else {
      // Enter intelligent simulation/dev mode
      this.isSimulationMode = true;
      return this.startSimulationMode();
    }
  }

  public stopServer(): { success: boolean; message: string } {
    if (this.status === 'OFFLINE' || this.status === 'STOPPING') {
      return { success: false, message: 'Server is not running.' };
    }

    this.setStatus('STOPPING');
    this.appendLog('\x1b[33m[Server]\x1b[0m Stopping the server (graceful shutdown)...');

    if (this.serverProcess) {
      this.sendCommand('stop');
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          this.serverProcess.kill('SIGTERM');
        }
      }, 5000);
    } else {
      setTimeout(() => {
        this.appendLog('\x1b[32m[Server]\x1b[0m ThreadedServer stopped. Server shutdown complete.');
        this.setStatus('OFFLINE');
        if (this.metricsInterval) clearInterval(this.metricsInterval);
      }, 1500);
    }

    return { success: true, message: 'Shutdown sequence initiated.' };
  }

  public restartServer(): { success: boolean; message: string } {
    this.stopServer();
    setTimeout(() => {
      this.startServer();
    }, 2500);
    return { success: true, message: 'Restart sequence scheduled.' };
  }

  public killServer(): { success: boolean; message: string } {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGKILL');
      this.serverProcess = null;
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.setStatus('OFFLINE');
    this.appendLog('\x1b[31m[AquaForge]\x1b[0m Server process killed immediately via SIGKILL.');
    return { success: true, message: 'Server killed.' };
  }

  public sendCommand(cmd: string): { success: boolean; message: string } {
    this.appendLog(`\x1b[35m[CONSOLE] >\x1b[0m ${cmd}`);

    if (this.serverProcess && this.serverProcess.stdin) {
      this.serverProcess.stdin.write(cmd + '\n');
      return { success: true, message: 'Command sent to process stdin.' };
    }

    // Simulation command handler
    if (cmd.toLowerCase() === 'tps') {
      this.appendLog(`\x1b[32m[Server]\x1b[0m TPS from last 1m, 5m, 15m: 20.0, 20.0, 19.98`);
    } else if (cmd.toLowerCase() === 'spark' || cmd.toLowerCase() === 'spark tps') {
      this.appendLog(`\x1b[36m[spark]\x1b[0m TPS: 20.0 | MSPT: ${this.metrics.mspt.toFixed(1)}ms | CPU: ${this.metrics.cpuPercent}%`);
    } else if (cmd.toLowerCase() === 'plugins' || cmd.toLowerCase() === 'pl') {
      this.appendLog(`\x1b[37m[Server]\x1b[0m Plugins (5): \x1b[32mAquaFishing\x1b[0m, \x1b[32mAquaMap\x1b[0m, \x1b[32mLuckPerms\x1b[0m, \x1b[32mVault\x1b[0m, \x1b[32mspark\x1b[0m`);
    } else if (cmd.toLowerCase().startsWith('trigger error')) {
      this.triggerSampleError();
    } else {
      this.appendLog(`\x1b[32m[Server]\x1b[0m Executed '${cmd}' successfully.`);
    }

    return { success: true, message: 'Command processed.' };
  }

  public triggerSampleError() {
    const errorLines = [
      '\x1b[31m[ERROR] [AquaFishing] Could not pass event PlayerFishEvent to AquaFishing v1.0.0\x1b[0m',
      'org.bukkit.event.EventException: null',
      '\tat org.bukkit.plugin.java.JavaPluginLoader$1.execute(JavaPluginLoader.java:306)',
      '\tat org.bukkit.plugin.RegisteredListener.execute(RegisteredListener.java:62)',
      '\tat com.efekoc.aquafishing.listener.PlayerFishListener.onPlayerCatchFish(PlayerFishListener.java:84)',
      '\tat com.efekoc.aquafishing.manager.FishingRewardManager.giveCustomFish(FishingRewardManager.java:128)',
      'Caused by: java.lang.NullPointerException: Cannot invoke "org.bukkit.inventory.ItemStack.getType()" because "rewardItem" is null',
      '\tat com.efekoc.aquafishing.listener.PlayerFishListener.onPlayerCatchFish(PlayerFishListener.java:84)'
    ];

    errorLines.forEach(l => this.appendLog(l));
    this.diagnosticEngine.analyzeLogBuffer(errorLines);
  }

  private spawnRealServer(jarPath: string): { success: boolean; message: string } {
    try {
      const args = [
        `-Xms${this.config.minMemory}`,
        `-Xmx${this.config.maxMemory}`,
        ...this.config.javaArgs,
        '-jar',
        jarPath,
        'nogui'
      ];

      this.appendLog(`\x1b[36m[AquaForge]\x1b[0m Spawning: ${this.config.javaPath} ${args.join(' ')}`);

      this.serverProcess = spawn(this.config.javaPath, args, {
        cwd: this.serverDir,
        env: process.env
      });

      this.serverProcess.stdout?.on('data', (data) => {
        const text = data.toString('utf8');
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim().length > 0) {
            this.appendLog(line);
            if (line.includes('Done (') && line.includes('For help, type "help"')) {
              this.setStatus('ONLINE');
            }
          }
        }
        this.diagnosticEngine.analyzeLogBuffer(lines);
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const text = data.toString('utf8');
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim().length > 0) {
            this.appendLog(`\x1b[31m${line}\x1b[0m`);
          }
        }
        this.diagnosticEngine.analyzeLogBuffer(lines);
      });

      this.serverProcess.on('exit', (code) => {
        this.appendLog(`\x1b[33m[Server]\x1b[0m Server process exited with code ${code}`);
        this.setStatus(code === 0 ? 'OFFLINE' : 'CRASHED');
        this.serverProcess = null;
        if (this.metricsInterval) clearInterval(this.metricsInterval);
      });

      this.startMetricsTracker();
      return { success: true, message: 'Server process spawned successfully.' };
    } catch (err: any) {
      this.setStatus('CRASHED');
      this.appendLog(`\x1b[31m[AquaForge]\x1b[0m Failed to spawn server: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  private startSimulationMode(): { success: boolean; message: string } {
    this.appendLog('\x1b[35m[AquaForge]\x1b[0m Dev/Simulation Engine active (Paper 1.21.4 Architecture).');
    this.appendLog('\x1b[37m[Server]\x1b[0m Loading Paper 1.21.4-R0.1-SNAPSHOT (Implementing API version 1.21.4)');
    
    setTimeout(() => {
      this.appendLog('\x1b[32m[Server]\x1b[0m Loading 5 plugins...');
      this.appendLog('\x1b[32m[AquaFishing]\x1b[0m \x1b[36m[v1.0.0]\x1b[0m Enabling AquaFishing by efekkoc...');
      this.appendLog('\x1b[32m[AquaFishing]\x1b[0m Initialized 40 custom fish types, RPG rod leveling, and bossbars.');
      this.appendLog('\x1b[32m[AquaMap]\x1b[0m \x1b[36m[v1.2.0]\x1b[0m Enabling AquaMap by efekkoc...');
      this.appendLog('\x1b[32m[AquaMap]\x1b[0m Async radar thread started (20 ticks/sec).');
      this.appendLog('\x1b[32m[LuckPerms]\x1b[0m Enabling LuckPerms v5.4.102...');
      this.appendLog('\x1b[32m[Vault]\x1b[0m Enabling Vault v1.7.3...');
      this.appendLog('\x1b[32m[spark]\x1b[0m Starting background sampler (CPU, memory, tick rate)...');
    }, 800);

    setTimeout(() => {
      this.appendLog('\x1b[32m[Server]\x1b[0m Preparing spawn area: 100%');
      this.appendLog('\x1b[32m[Server]\x1b[0m \x1b[1mDone (3.412s)! For help, type "help"\x1b[0m');
      this.appendLog('\x1b[36m[AquaForge]\x1b[0m Server is fully \x1b[32mONLINE\x1b[0m on port 25565.');
      this.setStatus('ONLINE');
    }, 1800);

    this.startMetricsTracker();
    return { success: true, message: 'Server started in Dev/Simulation mode.' };
  }

  private startMetricsTracker() {
    if (this.metricsInterval) clearInterval(this.metricsInterval);

    this.metricsInterval = setInterval(() => {
      if (this.status !== 'ONLINE') return;

      this.metrics.uptimeSeconds += 2;
      this.simStep++;

      // Realistic subtle variations
      const tpsJitter = (Math.random() - 0.48) * 0.05;
      this.metrics.tps = Math.min(20.0, Math.max(19.85, 20.0 + tpsJitter));

      const msptJitter = (Math.random() - 0.5) * 1.5;
      this.metrics.mspt = Math.max(8.5, Math.min(18.0, 11.5 + msptJitter));

      const cpuJitter = (Math.random() - 0.5) * 3;
      this.metrics.cpuPercent = Math.max(2.1, Math.min(15.0, 5.2 + cpuJitter));

      this.metrics.memoryUsedMB = 1250 + Math.floor(Math.sin(this.simStep / 5) * 80);

      if (this.onMetricsCallback) {
        this.onMetricsCallback(this.metrics);
      }
    }, 2000);
  }

  private appendLog(line: string) {
    this.logHistory.push(line);
    if (this.logHistory.length > 1000) {
      this.logHistory.shift();
    }
    if (this.onLogCallback) {
      this.onLogCallback(line);
    }
  }

  private resetMetrics() {
    this.metrics.tps = 0.0;
    this.metrics.mspt = 0.0;
    this.metrics.cpuPercent = 0.0;
    this.metrics.memoryUsedMB = 0;
    this.metrics.onlinePlayers = 0;
    if (this.onMetricsCallback) {
      this.onMetricsCallback(this.metrics);
    }
  }

  private setStatus(newStatus: ServerStatus) {
    this.status = newStatus;
    if (newStatus === 'OFFLINE' || newStatus === 'CRASHED') {
      this.resetMetrics();
    }
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(newStatus);
    }
  }
}
