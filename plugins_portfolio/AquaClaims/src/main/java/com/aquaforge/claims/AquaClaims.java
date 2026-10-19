package com.aquaforge.claims;

import org.bukkit.Bukkit;
import org.bukkit.Chunk;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaClaims - Visual Land Claiming & Anti-Grief Engine.
 * Universal support for Paper 1.20.x – 1.21.11 (Optimized for 1.21.1, 1.21.4 & 1.21.11 Mounts of Mayhem).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaClaims extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaClaims instance;
    // Chunk key ("world,x,z") -> Owner UUID
    private final Map<String, UUID> claimOwners = new HashMap<>();
    // Owner UUID -> Set of trusted player UUIDs
    private final Map<UUID, Set<UUID>> trustedPlayers = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("claim") != null) getCommand("claim").setExecutor(this);
        if (getCommand("unclaim") != null) getCommand("unclaim").setExecutor(this);
        if (getCommand("trust") != null) getCommand("trust").setExecutor(this);
        if (getCommand("untrust") != null) getCommand("untrust").setExecutor(this);

        getLogger().info("=========================================");
        getLogger().info(" AquaClaims v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.11 Mounts of Mayhem Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        claimOwners.clear();
        trustedPlayers.clear();
    }

    public static AquaClaims getInstance() {
        return instance;
    }

    private String getChunkKey(Chunk chunk) {
        return chunk.getWorld().getName() + "," + chunk.getX() + "," + chunk.getZ();
    }

    public boolean canBuild(Player player, Location loc) {
        if (player.hasPermission("aquaclaims.admin")) return true;

        String key = getChunkKey(loc.getChunk());
        UUID owner = claimOwners.get(key);

        if (owner == null) return true; // Wilderness
        if (owner.equals(player.getUniqueId())) return true; // Owner

        Set<UUID> trusted = trustedPlayers.get(owner);
        return trusted != null && trusted.contains(player.getUniqueId());
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Players only.");
            return true;
        }

        String name = command.getName().toLowerCase();
        Chunk chunk = player.getLocation().getChunk();
        String key = getChunkKey(chunk);

        if (name.equals("claim")) {
            if (claimOwners.containsKey(key)) {
                UUID existing = claimOwners.get(key);
                if (existing.equals(player.getUniqueId())) {
                    player.sendMessage(ChatColor.YELLOW + "[AquaClaims] You already own this land claim!");
                } else {
                    player.sendMessage(ChatColor.RED + "[AquaClaims] This chunk is already claimed by another player!");
                }
                return true;
            }

            claimOwners.put(key, player.getUniqueId());
            player.sendMessage(ChatColor.GREEN + "[AquaClaims] ✦ Successfully claimed this chunk (" + chunk.getX() + ", " + chunk.getZ() + ")!");
            player.playSound(player.getLocation(), Sound.BLOCK_BEACON_ACTIVATE, 1.0f, 1.2f);

            // Highlight border particles
            showChunkBorders(player, chunk);
            return true;
        }

        if (name.equals("unclaim")) {
            UUID owner = claimOwners.get(key);
            if (owner == null || !owner.equals(player.getUniqueId())) {
                player.sendMessage(ChatColor.RED + "[AquaClaims] You do not own a claim here.");
                return true;
            }
            claimOwners.remove(key);
            player.sendMessage(ChatColor.YELLOW + "[AquaClaims] Land claim abandoned.");
            player.playSound(player.getLocation(), Sound.BLOCK_BEACON_DEACTIVATE, 1.0f, 1.0f);
            return true;
        }

        if (name.equals("trust")) {
            if (args.length < 1) {
                player.sendMessage(ChatColor.RED + "Usage: /trust <player>");
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                player.sendMessage(ChatColor.RED + "Player not found!");
                return true;
            }
            trustedPlayers.computeIfAbsent(player.getUniqueId(), k -> new HashSet<>()).add(target.getUniqueId());
            player.sendMessage(ChatColor.GREEN + "[AquaClaims] Granted build trust to " + target.getName() + " in all your claims!");
            target.sendMessage(ChatColor.GREEN + "[AquaClaims] You were trusted by " + player.getName() + "!");
            return true;
        }

        if (name.equals("untrust")) {
            if (args.length < 1) {
                player.sendMessage(ChatColor.RED + "Usage: /untrust <player>");
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target != null && trustedPlayers.containsKey(player.getUniqueId())) {
                trustedPlayers.get(player.getUniqueId()).remove(target.getUniqueId());
            }
            player.sendMessage(ChatColor.YELLOW + "[AquaClaims] Revoked trust from " + args[0] + ".");
            return true;
        }

        return false;
    }

    private void showChunkBorders(Player player, Chunk chunk) {
        int minX = chunk.getX() * 16;
        int minZ = chunk.getZ() * 16;
        int y = player.getLocation().getBlockY() + 1;

        for (int i = 0; i <= 16; i += 2) {
            player.spawnParticle(Particle.FLAME, minX + i, y, minZ, 1, 0, 0, 0, 0);
            player.spawnParticle(Particle.FLAME, minX + i, y, minZ + 16, 1, 0, 0, 0, 0);
            player.spawnParticle(Particle.FLAME, minX, y, minZ + i, 1, 0, 0, 0, 0);
            player.spawnParticle(Particle.FLAME, minX + 16, y, minZ + i, 1, 0, 0, 0, 0);
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onBreak(BlockBreakEvent event) {
        if (!canBuild(event.getPlayer(), event.getBlock().getLocation())) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(ChatColor.RED + "[AquaClaims] This block is protected by a land claim!");
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onPlace(BlockPlaceEvent event) {
        if (!canBuild(event.getPlayer(), event.getBlock().getLocation())) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(ChatColor.RED + "[AquaClaims] You cannot build here!");
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onInteract(PlayerInteractEvent event) {
        if (event.getClickedBlock() != null && !canBuild(event.getPlayer(), event.getClickedBlock().getLocation())) {
            event.setCancelled(true);
        }
    }
}
