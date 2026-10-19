package com.aquaforge.staff;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * AquaStaff - Unified Staff Mode, Vanish & Moderation Suite.
 * Universal support for Paper 1.20.x – 1.21.4 (Optimized for 1.21.1 & 1.21.4).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaStaff extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaStaff instance;
    private final Set<UUID> inStaffMode = new HashSet<>();
    private final Set<UUID> vanished = new HashSet<>();
    private final Set<UUID> frozenPlayers = new HashSet<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("staff") != null) getCommand("staff").setExecutor(this);
        if (getCommand("vanish") != null) getCommand("vanish").setExecutor(this);
        if (getCommand("freeze") != null) getCommand("freeze").setExecutor(this);
        if (getCommand("invsee") != null) getCommand("invsee").setExecutor(this);

        getLogger().info("=========================================");
        getLogger().info(" AquaStaff v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.4 Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        frozenPlayers.clear();
        vanished.clear();
        inStaffMode.clear();
    }

    public static AquaStaff getInstance() {
        return instance;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Players only.");
            return true;
        }

        if (!player.hasPermission("aquastaff.mod")) {
            player.sendMessage(ChatColor.RED + "You do not have permission for staff moderation.");
            return true;
        }

        String name = command.getName().toLowerCase();

        if (name.equals("staff")) {
            UUID id = player.getUniqueId();
            if (inStaffMode.contains(id)) {
                inStaffMode.remove(id);
                player.setAllowFlight(false);
                player.setFlying(false);
                unvanish(player);
                player.sendMessage(ChatColor.RED + "[AquaStaff] Staff mode deactivated.");
            } else {
                inStaffMode.add(id);
                player.setAllowFlight(true);
                player.setFlying(true);
                vanish(player);
                player.sendMessage(ChatColor.GREEN + "[AquaStaff] Staff mode activated! Flight & Vanish enabled.");
            }
            player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_CHIME, 1.0f, 1.2f);
            return true;
        }

        if (name.equals("vanish")) {
            if (vanished.contains(player.getUniqueId())) {
                unvanish(player);
                player.sendMessage(ChatColor.RED + "[AquaStaff] You are now visible to players.");
            } else {
                vanish(player);
                player.sendMessage(ChatColor.GREEN + "[AquaStaff] You are now completely invisible (Vanished).");
            }
            return true;
        }

        if (name.equals("freeze")) {
            if (args.length < 1) {
                player.sendMessage(ChatColor.RED + "Usage: /freeze <player>");
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                player.sendMessage(ChatColor.RED + "Player not found!");
                return true;
            }

            UUID tid = target.getUniqueId();
            if (frozenPlayers.contains(tid)) {
                frozenPlayers.remove(tid);
                target.removePotionEffect(PotionEffectType.BLINDNESS);
                target.sendTitle(ChatColor.GREEN + "UNFROZEN", "You may continue playing.", 10, 40, 10);
                player.sendMessage(ChatColor.GREEN + "Unfroze " + target.getName() + ".");
            } else {
                frozenPlayers.add(tid);
                target.addPotionEffect(new PotionEffect(PotionEffectType.BLINDNESS, 20 * 600, 1));
                target.sendTitle(ChatColor.RED + "" + ChatColor.BOLD + "YOU ARE FROZEN", "Do NOT log out! Check chat.", 10, 200, 10);
                player.sendMessage(ChatColor.YELLOW + "Frozen " + target.getName() + " for investigation.");
            }
            return true;
        }

        if (name.equals("invsee")) {
            if (args.length < 1) {
                player.sendMessage(ChatColor.RED + "Usage: /invsee <player>");
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                player.sendMessage(ChatColor.RED + "Player not found!");
                return true;
            }
            player.openInventory(target.getInventory());
            return true;
        }

        return false;
    }

    private void vanish(Player p) {
        vanished.add(p.getUniqueId());
        for (Player other : Bukkit.getOnlinePlayers()) {
            if (!other.hasPermission("aquastaff.mod")) {
                other.hidePlayer(this, p);
            }
        }
    }

    private void unvanish(Player p) {
        vanished.remove(p.getUniqueId());
        for (Player other : Bukkit.getOnlinePlayers()) {
            other.showPlayer(this, p);
        }
    }

    @EventHandler
    public void onMove(PlayerMoveEvent event) {
        if (frozenPlayers.contains(event.getPlayer().getUniqueId())) {
            Location from = event.getFrom();
            Location to = event.getTo();
            if (to != null && (from.getX() != to.getX() || from.getY() != to.getY() || from.getZ() != to.getZ())) {
                event.setTo(from);
            }
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        frozenPlayers.remove(event.getPlayer().getUniqueId());
        vanished.remove(event.getPlayer().getUniqueId());
        inStaffMode.remove(event.getPlayer().getUniqueId());
    }
}
