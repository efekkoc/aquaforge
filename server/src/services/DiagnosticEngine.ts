import { DiagnosticReport } from '../types.js';
import crypto from 'crypto';

export class DiagnosticEngine {
  private reports: DiagnosticReport[] = [];
  private knownPlugins: Set<string> = new Set(['AquaFishing', 'AquaMap', 'LuckPerms', 'Vault', 'Essentials', 'WorldEdit', 'ProtocolLib']);

  constructor() {
    this.seedSampleReports();
  }

  public registerKnownPlugins(pluginNames: string[]) {
    pluginNames.forEach(p => this.knownPlugins.add(p));
  }

  public getReports(): DiagnosticReport[] {
    return this.reports;
  }

  public getReportById(id: string): DiagnosticReport | undefined {
    return this.reports.find(r => r.id === id);
  }

  public resolveReport(id: string): boolean {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.resolved = true;
      return true;
    }
    return false;
  }

  public clearReports() {
    this.reports = [];
  }

  /**
   * Analyzes an incoming log line or buffer of lines to detect exceptions and create diagnostic reports.
   */
  public analyzeLogBuffer(lines: string[]): DiagnosticReport | null {
    const fullText = lines.join('\n');

    // Look for Exception patterns: e.g. "java.lang.NullPointerException" or "org.bukkit.event.EventException"
    const exceptionRegex = /(java\.[a-zA-Z0-9_.]+(?:Exception|Error)|org\.bukkit\.[a-zA-Z0-9_.]+(?:Exception|Error)|net\.minecraft\.[a-zA-Z0-9_.]+(?:Exception|Error))/;
    const match = fullText.match(exceptionRegex);

    if (!match) {
      // Check for port binding error
      if (fullText.includes('FAILED TO BIND TO PORT') || fullText.includes('BindException: Address already in use')) {
        return this.createBindExceptionReport(lines);
      }
      // Check for OutOfMemory
      if (fullText.includes('java.lang.OutOfMemoryError')) {
        return this.createOutOfMemoryReport(lines);
      }
      // Check for YAML error
      if (fullText.includes('ScannerException') || fullText.includes('while scanning a simple key')) {
        return this.createYamlExceptionReport(lines);
      }
      return null;
    }

    const errorType = match[1];

    // Find the stack trace lines
    const stackTraceLines = lines.filter(l => l.trim().startsWith('at ') || l.includes('Exception:'));
    
    // Find the culprit plugin and exact line
    const location = this.extractCulpritLocation(stackTraceLines);
    const culpritPlugin = this.detectCulpritPlugin(stackTraceLines, location?.className);

    const diagnostic = this.buildDiagnostic(errorType, culpritPlugin, location, stackTraceLines, fullText);
    this.reports.unshift(diagnostic);
    return diagnostic;
  }

  private extractCulpritLocation(stackLines: string[]) {
    // Look for lines like "at com.efekoc.aquafishing.listener.FishingListener.onFish(FishingListener.java:42)"
    const atRegex = /at\s+([a-zA-Z0-9_.$]+)\.([a-zA-Z0-9_]+)\(([^:]+):(\d+)\)/;

    for (const line of stackLines) {
      // Skip internal JDK / Bukkit dispatch calls to find plugin code
      if (line.includes('java.base') || line.includes('org.bukkit.plugin.java.JavaPluginLoader') || line.includes('net.minecraft')) {
        continue;
      }

      const m = line.match(atRegex);
      if (m) {
        return {
          className: m[1],
          methodName: m[2],
          fileName: m[3],
          lineNumber: parseInt(m[4], 10)
        };
      }
    }

    // Fallback to first line with at
    for (const line of stackLines) {
      const m = line.match(atRegex);
      if (m) {
        return {
          className: m[1],
          methodName: m[2],
          fileName: m[3],
          lineNumber: parseInt(m[4], 10)
        };
      }
    }

    return undefined;
  }

  private detectCulpritPlugin(stackLines: string[], className?: string): string | null {
    if (className) {
      const lower = className.toLowerCase();
      if (lower.includes('aquafishing')) return 'AquaFishing';
      if (lower.includes('aquamap')) return 'AquaMap';
      if (lower.includes('luckperms')) return 'LuckPerms';
      if (lower.includes('vault')) return 'Vault';
      if (lower.includes('essentials')) return 'Essentials';
      if (lower.includes('worldedit')) return 'WorldEdit';
    }

    for (const plugin of this.knownPlugins) {
      const lowerPlugin = plugin.toLowerCase();
      for (const line of stackLines) {
        if (line.toLowerCase().includes(lowerPlugin)) {
          return plugin;
        }
      }
    }

    return null;
  }

  private buildDiagnostic(
    errorType: string,
    culpritPlugin: string | null,
    location: { className: string; methodName: string; fileName: string; lineNumber: number } | undefined,
    stackTrace: string[],
    rawLog: string
  ): DiagnosticReport {
    let severity: DiagnosticReport['severity'] = 'HIGH';
    let explanation = `An unhandled ${errorType} occurred during execution.`;
    let recommendedFix = 'Inspect the stack trace for null dereferences or incompatible method signatures.';
    let codeSnippet = '';

    if (errorType.includes('NullPointerException')) {
      severity = 'HIGH';
      explanation = `A variable or reference was evaluated as null before calling a method or accessing a property.`;
      if (location) {
        explanation += ` Culprit location: ${location.className}.${location.methodName}() at ${location.fileName}:${location.lineNumber}.`;
        recommendedFix = `Add a defensive null check or Optional verification at ${location.fileName} line ${location.lineNumber}.`;
        codeSnippet = `// Solution at ${location.fileName}:${location.lineNumber}\nif (targetObject != null) {\n    targetObject.${location.methodName}();\n} else {\n    // Log warning or return early\n    getLogger().warning("[AquaForge] targetObject is null in ${location.methodName}");\n}`;
      }
    } else if (errorType.includes('ConcurrentModificationException')) {
      severity = 'CRITICAL';
      explanation = `A collection (e.g. ArrayList, HashMap) was modified while being iterated over, typically inside a Bukkit task or event listener.`;
      recommendedFix = `Use a CopyOnWriteArrayList, ConcurrentHashMap, or use an Iterator.remove() instead of modifying the collection directly.`;
      codeSnippet = `// Solution: Replace standard collection with Concurrent collection or clone:\nfor (UUID playerId : new ArrayList<>(activePlayers)) {\n    // Safe to modify original collection here\n}`;
    } else if (errorType.includes('NoSuchMethodError') || errorType.includes('NoClassDefFoundError')) {
      severity = 'CRITICAL';
      explanation = `The plugin is calling an API method that does not exist in this Paper 1.21 server version. This indicates an API version incompatibility or missing library dependency.`;
      recommendedFix = `Update the plugin dependencies in build.gradle to match the server's Paper API version (1.21.x) or verify your plugin.yml 'depend' field.`;
      codeSnippet = `// In build.gradle:\ndependencies {\n    compileOnly("io.papermc.paper:paper-api:1.21.4-R0.1-SNAPSHOT")\n}`;
    } else if (errorType.includes('EventException')) {
      severity = 'HIGH';
      explanation = `An exception was thrown inside an event listener callback. Check the nested 'Caused by' exception for the true source.`;
      recommendedFix = `Surround the event listener logic with try-catch or ensure all Bukkit API entities (player, block, item) are validated before handling.`;
    }

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity,
      errorType,
      culpritPlugin,
      message: rawLog.split('\n')[0] || errorType,
      stackTrace: stackTrace.length > 0 ? stackTrace : [rawLog],
      location,
      explanation,
      recommendedFix,
      codeSnippet,
      resolved: false
    };
  }

  private createBindExceptionReport(lines: string[]): DiagnosticReport {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      errorType: 'java.net.BindException: Address already in use',
      culpritPlugin: null,
      message: 'Failed to bind to port 25565. The port is already being used by another Minecraft server or application.',
      stackTrace: lines,
      explanation: 'Port 25565 is locked by another running Java/Minecraft process.',
      recommendedFix: 'Terminate the existing server process using `killall -9 java` or change `server-port=25566` in server.properties.',
      codeSnippet: '# Terminal command to check process on port 25565:\nlsof -i :25565\n# Kill process:\nkill -9 <PID>',
      resolved: false
    };
  }

  private createOutOfMemoryReport(lines: string[]): DiagnosticReport {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      errorType: 'java.lang.OutOfMemoryError: Java heap space',
      culpritPlugin: null,
      message: 'The JVM ran out of allocated heap memory.',
      stackTrace: lines,
      explanation: 'The Minecraft server exceeded the maximum RAM limit (-Xmx) configured in startup arguments, or a plugin has a severe memory leak.',
      recommendedFix: 'Increase server RAM allocation (e.g. from -Xmx2G to -Xmx4G or -Xmx8G) in AquaForge Server Settings.',
      codeSnippet: '# Recommended Aikar Garbage Collector flags:\njava -Xms4G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -jar paper.jar nogui',
      resolved: false
    };
  }

  private createYamlExceptionReport(lines: string[]): DiagnosticReport {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      errorType: 'org.yaml.snakeyaml.scanner.ScannerException',
      culpritPlugin: 'AquaFishing',
      message: 'Malformed YAML configuration: illegal tab or misaligned indentation found.',
      stackTrace: lines,
      explanation: 'Minecraft config.yml files cannot contain TAB characters and must use consistent 2-space indentation.',
      recommendedFix: 'Use AquaForge Built-in Config Inspector to auto-format and fix indentation errors in config.yml.',
      codeSnippet: '# Fix in config.yml (replace TAB with 2 spaces):\nfishing:\n  rewards:\n    custom-fish:\n      drop-chance: 0.15',
      resolved: false
    };
  }

  private seedSampleReports() {
    this.reports.push({
      id: 'demo-diagnostic-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      severity: 'HIGH',
      errorType: 'java.lang.NullPointerException',
      culpritPlugin: 'AquaFishing',
      message: 'Cannot invoke "org.bukkit.inventory.ItemStack.getType()" because "rewardItem" is null',
      stackTrace: [
        'org.bukkit.event.EventException: null',
        'at org.bukkit.plugin.java.JavaPluginLoader$1.execute(JavaPluginLoader.java:306)',
        'at org.bukkit.plugin.RegisteredListener.execute(RegisteredListener.java:62)',
        'at com.efekoc.aquafishing.listener.PlayerFishListener.onPlayerCatchFish(PlayerFishListener.java:84)',
        'at com.efekoc.aquafishing.manager.FishingRewardManager.giveCustomFish(FishingRewardManager.java:128)',
        'at org.bukkit.plugin.SimplePluginManager.fireEvent(SimplePluginManager.java:500)'
      ],
      location: {
        className: 'com.efekoc.aquafishing.listener.PlayerFishListener',
        methodName: 'onPlayerCatchFish',
        fileName: 'PlayerFishListener.java',
        lineNumber: 84
      },
      explanation: 'The reward item lookup returned null because the custom fish model key was not defined in config.yml, causing a NullPointerException when querying the item type.',
      recommendedFix: 'Add defensive null validation before querying ItemStack properties and ensure default fish items fall back to Material.COD.',
      codeSnippet: `// In PlayerFishListener.java:84\nItemStack rewardItem = rewardManager.getFish(fishId);\nif (rewardItem == null) {\n    plugin.getLogger().warning("Invalid fish ID: " + fishId + ", falling back to RAW_COD");\n    rewardItem = new ItemStack(Material.COD);\n}\nplayer.getInventory().addItem(rewardItem);`,
      resolved: false
    });

    this.reports.push({
      id: 'demo-diagnostic-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      severity: 'MEDIUM',
      errorType: 'java.util.ConcurrentModificationException',
      culpritPlugin: 'AquaMap',
      message: 'ConcurrentModificationException inside radar update task',
      stackTrace: [
        'java.util.ConcurrentModificationException',
        'at java.base/java.util.HashMap$HashIterator.nextNode(HashMap.java:1598)',
        'at com.efekoc.aquamap.task.RadarUpdateTask.run(RadarUpdateTask.java:62)',
        'at io.papermc.paper.threadedregions.RegionizedServer.tick(RegionizedServer.java:142)'
      ],
      location: {
        className: 'com.efekoc.aquamap.task.RadarUpdateTask',
        methodName: 'run',
        fileName: 'RadarUpdateTask.java',
        lineNumber: 62
      },
      explanation: 'The radar player tracker was iterating over player markers on an asynchronous thread while a player disconnected, modifying the map concurrently.',
      recommendedFix: 'Use ConcurrentHashMap for tracked players or perform iterations over an immutable snapshot using List.copyOf().',
      codeSnippet: `// In RadarUpdateTask.java:62\n// Replace: for (Player p : trackedPlayers.values())\nfor (Player p : new ArrayList<>(trackedPlayers.values())) {\n    updatePlayerCompass(p);\n}`,
      resolved: false
    });
  }
}
