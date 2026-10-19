package com.aquaforge.watchdog.check;

import com.aquaforge.watchdog.AquaWatchdog;
import org.bukkit.entity.Player;

import java.util.*;

/**
 * Real-time Sliding Window CPS & Macro Anomaly Check.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class CpsCheck {

    private final AquaWatchdog plugin;
    private final Map<UUID, List<Long>> clickTimestamps = new HashMap<>();

    public CpsCheck(AquaWatchdog plugin) {
        this.plugin = plugin;
    }

    public void recordClick(Player player) {
        if (!plugin.getConfig().getBoolean("cps.enabled", true)) return;
        if (player.hasPermission("aquawatchdog.bypass")) return;

        long now = System.currentTimeMillis();
        UUID uuid = player.getUniqueId();

        List<Long> clicks = clickTimestamps.computeIfAbsent(uuid, k -> new ArrayList<>());
        clicks.add(now);

        // Remove clicks older than 1000ms
        clicks.removeIf(t -> now - t > 1000);

        int currentCps = clicks.size();
        int maxAllowed = plugin.getConfig().getInt("cps.max-cps", 20);

        if (currentCps > maxAllowed) {
            String details = currentCps + " clicks/sec (Limit: " + maxAllowed + ")";
            plugin.broadcastAlert(player, "AutoClicker", details);
            plugin.getWebhookDispatcher().dispatchAlert(player.getName(), "AutoClicker", details, player.getPing());
        }
    }

    public void clear(UUID uuid) {
        clickTimestamps.remove(uuid);
    }
}
