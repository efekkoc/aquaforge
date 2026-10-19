package com.aquaforge.dungeons;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Sound;
import org.bukkit.boss.BarColor;
import org.bukkit.boss.BarStyle;
import org.bukkit.boss.BossBar;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * AquaDungeons - Procedural Wave-based Mob Arena & Boss Engine.
 * Universal support for Paper 1.20.x – 1.21.4 (Optimized for 1.21.1 & 1.21.4).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaDungeons extends JavaPlugin implements CommandExecutor {

    private static AquaDungeons instance;
    private final Set<UUID> activeRaiders = new HashSet<>();
    private BossBar activeBossBar;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        if (getCommand("aquadungeons") != null) {
            getCommand("aquadungeons").setExecutor(this);
        }

        getLogger().info("=========================================");
        getLogger().info(" AquaDungeons v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.4 Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        if (activeBossBar != null) activeBossBar.removeAll();
        activeRaiders.clear();
    }

    public static AquaDungeons getInstance() {
        return instance;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Players only.");
            return true;
        }

        if (args.length == 0) {
            player.sendMessage(ChatColor.DARK_AQUA + "AquaDungeons Commands: /dungeon join, /dungeon leave, /dungeon startwave");
            return true;
        }

        String sub = args[0].toLowerCase();

        switch (sub) {
            case "join" -> {
                activeRaiders.add(player.getUniqueId());
                player.sendMessage(ChatColor.GREEN + "[AquaDungeons] You joined the Dungeon Raid queue!");
                player.playSound(player.getLocation(), Sound.ITEM_ARMOR_EQUIP_NETHERITE, 1.0f, 1.0f);
            }
            case "leave" -> {
                activeRaiders.remove(player.getUniqueId());
                if (activeBossBar != null) activeBossBar.removePlayer(player);
                player.sendMessage(ChatColor.YELLOW + "[AquaDungeons] You left the dungeon.");
            }
            case "startwave" -> {
                if (!player.hasPermission("aquadungeons.admin")) {
                    player.sendMessage(ChatColor.RED + "No permission.");
                    return true;
                }
                startDungeonWave(player.getLocation());
                player.sendMessage(ChatColor.GOLD + "[AquaDungeons] Wave 1 summoned!");
            }
            default -> player.sendMessage(ChatColor.RED + "Unknown sub-command.");
        }

        return true;
    }

    public void startDungeonWave(Location center) {
        if (activeBossBar == null) {
            activeBossBar = Bukkit.createBossBar(
                    ChatColor.RED + "" + ChatColor.BOLD + "Dungeon Wave 1 / 5",
                    BarColor.RED,
                    BarStyle.SEGMENTED_6
            );
        }

        for (Player p : Bukkit.getOnlinePlayers()) {
            activeBossBar.addPlayer(p);
            p.playSound(p.getLocation(), Sound.ENTITY_WITHER_SPAWN, 0.7f, 1.2f);
            p.sendTitle(ChatColor.DARK_RED + "DUNGEON WAVE 1", "Defeat all spawned creatures!", 10, 40, 10);
        }

        // Spawn test wave enemies around location
        for (int i = 0; i < 4; i++) {
            center.getWorld().spawnEntity(center.clone().add(i * 2, 0, i * 2), EntityType.ZOMBIE);
        }
    }
}
