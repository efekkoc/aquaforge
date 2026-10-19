import { PluginMeta, DependencyCheckResult } from '../types.js';

// Common Minecraft ecosystem dependencies metadata
const KNOWN_DEPENDENCIES: Record<string, { suggestedJar: string; downloadSlug: string }> = {
  Vault: { suggestedJar: 'Vault-1.7.3.jar', downloadSlug: 'vault' },
  ProtocolLib: { suggestedJar: 'ProtocolLib-5.3.0.jar', downloadSlug: 'protocollib' },
  PlaceholderAPI: { suggestedJar: 'PlaceholderAPI-2.11.6.jar', downloadSlug: 'placeholderapi' },
  LuckPerms: { suggestedJar: 'LuckPerms-5.4.102.jar', downloadSlug: 'luckperms' },
  WorldEdit: { suggestedJar: 'worldedit-bukkit-7.3.0.jar', downloadSlug: 'worldedit' },
  Citizens: { suggestedJar: 'Citizens-2.0.35.jar', downloadSlug: 'citizens' },
  DecentHolograms: { suggestedJar: 'DecentHolograms-2.8.11.jar', downloadSlug: 'decentholograms' },
  Essentials: { suggestedJar: 'EssentialsX-2.20.1.jar', downloadSlug: 'essentialsx' },
  MultiverseCore: { suggestedJar: 'Multiverse-Core-4.3.1.jar', downloadSlug: 'multiverse-core' }
};

export class DependencyService {
  public analyze(plugins: PluginMeta[]): {
    totalChecked: number;
    missingRequired: DependencyCheckResult[];
    missingOptional: DependencyCheckResult[];
    allSatisfied: boolean;
  } {
    const installedNames = new Set(
      plugins.map(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    const missingRequired: DependencyCheckResult[] = [];
    const missingOptional: DependencyCheckResult[] = [];

    for (const plugin of plugins) {
      if (!plugin.enabled) continue;

      // Check Hard Dependencies
      for (const dep of plugin.depends || []) {
        const cleanDep = dep.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isInstalled = installedNames.has(cleanDep);
        if (!isInstalled) {
          const known = KNOWN_DEPENDENCIES[dep] || {
            suggestedJar: `${dep}-latest.jar`,
            downloadSlug: dep.toLowerCase()
          };
          missingRequired.push({
            pluginName: plugin.name,
            requiredDependency: dep,
            isInstalled: false,
            isOptional: false,
            suggestedJar: known.suggestedJar,
            downloadSlug: known.downloadSlug
          });
        }
      }

      // Check Soft Dependencies
      for (const softDep of plugin.softDepends || []) {
        const cleanSoft = softDep.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isInstalled = installedNames.has(cleanSoft);
        if (!isInstalled) {
          const known = KNOWN_DEPENDENCIES[softDep] || {
            suggestedJar: `${softDep}-latest.jar`,
            downloadSlug: softDep.toLowerCase()
          };
          missingOptional.push({
            pluginName: plugin.name,
            requiredDependency: softDep,
            isInstalled: false,
            isOptional: true,
            suggestedJar: known.suggestedJar,
            downloadSlug: known.downloadSlug
          });
        }
      }
    }

    return {
      totalChecked: plugins.length,
      missingRequired,
      missingOptional,
      allSatisfied: missingRequired.length === 0
    };
  }
}
