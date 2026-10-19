export interface ServerMetrics {
  tps: number;
  mspt: number;
  memoryUsedMB: number;
  memoryMaxMB: number;
  cpuPercent: number;
  onlinePlayers: number;
  maxPlayers: number;
  uptimeSeconds: number;
}

export type ServerStatus = 'OFFLINE' | 'STARTING' | 'ONLINE' | 'STOPPING' | 'CRASHED';

export interface ServerConfig {
  name: string;
  serverJar: string;
  minMemory: string;
  maxMemory: string;
  javaArgs: string[];
  javaPath: string;
  port: number;
  autoRestartOnCrash: boolean;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  errorType: string;
  culpritPlugin: string | null;
  message: string;
  stackTrace: string[];
  location?: {
    className: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
  };
  explanation: string;
  recommendedFix: string;
  codeSnippet?: string;
  resolved: boolean;
}

export interface PluginMeta {
  fileName: string;
  name: string;
  version: string;
  mainClass?: string;
  apiVersion?: string;
  authors: string[];
  description?: string;
  website?: string;
  depends: string[];
  softDepends: string[];
  enabled: boolean;
  fileSizeBytes: number;
  modifiedAt: string;
  source: 'LOCAL' | 'GITHUB' | 'MODRINTH';
}

export interface MarketplacePlugin {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  iconUrl?: string;
  downloads: number;
  categories: string[];
  versions: {
    versionNumber: string;
    gameVersions: string[];
    loaders: string[];
    downloadUrl: string;
    fileName: string;
  }[];
  source: 'MODRINTH' | 'GITHUB';
}

export interface GitHubRepoRelease {
  repoName: string;
  releaseTag: string;
  publishedAt: string;
  body: string;
  jarAsset?: {
    name: string;
    downloadUrl: string;
    size: number;
  };
}

export interface DevSyncWatcher {
  id: string;
  name: string;
  sourceDirectory: string;
  targetPluginName: string;
  active: boolean;
  autoReloadCommand?: string;
  lastSyncAt?: string;
}

export interface ResourcePackItem {
  id: string;
  fileName: string;
  sha1: string;
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl: string;
  isApplied: boolean;
}

export interface BackupArchive {
  id: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  type: 'FULL' | 'WORLD' | 'PLUGINS';
}

export interface DiscordWebhookConfig {
  enabled: boolean;
  url: string;
  serverName: string;
  notifyOnStart: boolean;
  notifyOnStop: boolean;
  notifyOnCrash: boolean;
  notifyOnLowTps: boolean;
}

export interface DependencyCheckResult {
  pluginName: string;
  requiredDependency: string;
  isInstalled: boolean;
  isOptional: boolean;
  suggestedJar?: string;
  downloadSlug?: string;
}

export interface WorldRadarPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  world: string;
  health: number;
  gamemode: string;
  ping: number;
}

