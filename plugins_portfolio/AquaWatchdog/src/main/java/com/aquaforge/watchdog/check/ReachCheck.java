package com.aquaforge.watchdog.check;

import com.aquaforge.watchdog.AquaWatchdog;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;

/**
 * Geometric Vector & Bounding Box Reach Anomaly Inspector.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class ReachCheck {

    private final AquaWatchdog plugin;

    public ReachCheck(AquaWatchdog plugin) {
        this.plugin = plugin;
    }

    public boolean inspectAttack(Player attacker, Entity victim) {
        if (!plugin.getConfig().getBoolean("reach.enabled", true)) return false;
        if (attacker.hasPermission("aquawatchdog.bypass")) return false;
        if (attacker.getGameMode() == GameMode.CREATIVE) return false;

        Location eyeLoc = attacker.getEyeLocation();
        Location victimLoc = victim.getLocation();

        // Calculate direct 3D distance adjusted for eye heights
        double distance = eyeLoc.distance(victimLoc);

        // Standard survival attack reach limit in vanilla is ~3.0 blocks (with latency buffer: 3.05 - 3.25)
        double maxReach = plugin.getConfig().getDouble("reach.max-distance", 3.05);

        if (distance > maxReach) {
            String details = String.format("%.2f blocks (Max: %.2f)", distance, maxReach);
            plugin.broadcastAlert(attacker, "Reach", details);
            plugin.getWebhookDispatcher().dispatchAlert(attacker.getName(), "Reach", details, attacker.getPing());

            return plugin.getConfig().getBoolean("reach.cancel-on-flag", true);
        }

        return false;
    }
}
