package com.aquaforge.watchdog;

import com.aquaforge.watchdog.check.CpsCheck;
import com.aquaforge.watchdog.check.ReachCheck;
import com.aquaforge.watchdog.command.WatchdogCommand;
import com.aquaforge.watchdog.listener.WatchdogPacketListener;
import com.aquaforge.watchdog.webhook.WatchdogWebhookDispatcher;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

/**
 * AquaWatchdog - CPS, Reach & Packet Anomaly Inspector with Webhook Triage.
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaWatchdog extends JavaPlugin {

    private static AquaWatchdog instance;
    private CpsCheck cpsCheck;
    private ReachCheck reachCheck;
    private WatchdogWebhookDispatcher webhookDispatcher;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        cpsCheck = new CpsCheck(this);
        reachCheck = new ReachCheck(this);
        webhookDispatcher = new WatchdogWebhookDispatcher(this);

        if (getCommand("watchdog") != null) {
            getCommand("watchdog").setExecutor(new WatchdogCommand(this));
        }

        getServer().getPluginManager().registerEvents(new WatchdogPacketListener(this), this);

        getLogger().info("=========================================");
        getLogger().info(" AquaWatchdog v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Live Anomaly & Webhook Triage Ready");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        getLogger().info("AquaWatchdog disabled cleanly.");
    }

    public static AquaWatchdog getInstance() {
        return instance;
    }

    public CpsCheck getCpsCheck() {
        return cpsCheck;
    }

    public ReachCheck getReachCheck() {
        return reachCheck;
    }

    public WatchdogWebhookDispatcher getWebhookDispatcher() {
        return webhookDispatcher;
    }

    public void broadcastAlert(Player player, String violation, String details) {
        if (!getConfig().getBoolean("broadcast-to-staff", true)) return;

        String msg = ChatColor.translateAlternateColorCodes('&',
                getConfig().getString("messages.prefix", "&b&lAquaWatchdog &8» ") +
                        "&c⚠ &f" + player.getName() + " &7flagged for &e" + violation +
                        " &8(&f" + details + "&8, &7ping: &f" + player.getPing() + "ms&8)");

        for (Player online : Bukkit.getOnlinePlayers()) {
            if (online.hasPermission("aquawatchdog.staff")) {
                online.sendMessage(msg);
                online.playSound(online.getLocation(), Sound.BLOCK_NOTE_BLOCK_PLING, 0.6f, 0.8f);
            }
        }
        getLogger().warning("[ALERT] " + player.getName() + " flagged for " + violation + ": " + details);
    }
}
