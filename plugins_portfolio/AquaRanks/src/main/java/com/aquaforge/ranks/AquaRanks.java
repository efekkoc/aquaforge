package com.aquaforge.ranks;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Bukkit;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaRanks - Lightweight In-Memory Ranks, Prefixes & Perms Engine.
 * Supports Paper 1.20.x through 1.21.11.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaRanks extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaRanks instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();
    private final Map<UUID, String> playerRanks = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("rank") != null) getCommand("rank").setExecutor(this);
        if (getCommand("rankinfo") != null) getCommand("rankinfo").setExecutor(this);

        getLogger().info("=================================================");
        getLogger().info(" AquaRanks v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Ranks");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        playerRanks.clear();
        getLogger().info("AquaRanks disabled gracefully.");
    }

    public static AquaRanks getInstance() {
        return instance;
    }

    public String getPlayerRank(UUID uuid) {
        return playerRanks.getOrDefault(uuid, getConfig().getString("settings.default_rank", "member"));
    }

    public void setPlayerRank(Player player, String rank) {
        playerRanks.put(player.getUniqueId(), rank.toLowerCase());
        updatePlayerPrefix(player);
    }

    public void updatePlayerPrefix(Player player) {
        String rank = getPlayerRank(player.getUniqueId());
        String prefix = getConfig().getString("ranks." + rank + ".prefix", "<gray>[Member] ");
        player.playerListName(miniMessage.deserialize(prefix + player.getName()));
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        updatePlayerPrefix(event.getPlayer());
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("rankinfo")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Console has no rank.");
                return true;
            }
            String rank = getPlayerRank(player.getUniqueId());
            String prefix = getConfig().getString("ranks." + rank + ".prefix", "<gray>[Member] ");
            player.sendMessage(miniMessage.deserialize("<gray>Your current rank is: " + prefix));
            return true;
        }

        if (command.getName().equalsIgnoreCase("rank")) {
            if (args.length >= 3 && args[0].equalsIgnoreCase("set")) {
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(miniMessage.deserialize("<red>Target player not found."));
                    return true;
                }

                String rank = args[2].toLowerCase();
                if (!getConfig().contains("ranks." + rank)) {
                    sender.sendMessage(miniMessage.deserialize("<red>Rank '" + rank + "' does not exist in config."));
                    return true;
                }

                setPlayerRank(target, rank);
                target.playSound(target.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
                target.sendMessage(miniMessage.deserialize("<green>Your rank has been updated to: " + getConfig().getString("ranks." + rank + ".prefix")));
                sender.sendMessage(miniMessage.deserialize("<green>Set rank of " + target.getName() + " to " + rank.toUpperCase()));
                return true;
            }

            if (args.length > 0 && args[0].equalsIgnoreCase("list")) {
                sender.sendMessage(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>=== Configured Ranks ===</gradient>"));
                if (getConfig().getConfigurationSection("ranks") != null) {
                    for (String r : getConfig().getConfigurationSection("ranks").getKeys(false)) {
                        sender.sendMessage(miniMessage.deserialize("<gold>• " + r + ": " + getConfig().getString("ranks." + r + ".prefix")));
                    }
                }
                return true;
            }

            sender.sendMessage(miniMessage.deserialize("<yellow>Usage: /rank set <player> <rank> | /rank list"));
            return true;
        }

        return false;
    }
}
