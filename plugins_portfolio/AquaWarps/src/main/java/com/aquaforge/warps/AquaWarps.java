package com.aquaforge.warps;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * AquaWarps - Universal Teleport, Safe-RTP, Homes, Warps & TPA Engine.
 * Supports Paper 1.20.x through 1.21.11.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaWarps extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaWarps instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    private Location spawnLocation;
    private final Map<String, Location> warps = new HashMap<>();
    private final Map<UUID, Map<String, Location>> playerHomes = new HashMap<>();
    private final Map<UUID, UUID> tpaRequests = new HashMap<>();
    private final Map<UUID, Long> rtpCooldowns = new HashMap<>();
    private final Set<UUID> pendingTeleports = new HashSet<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        String[] cmds = {"spawn", "setspawn", "warp", "setwarp", "rtp", "home", "sethome", "tpa", "tpaccept"};
        for (String c : cmds) {
            if (getCommand(c) != null) getCommand(c).setExecutor(this);
        }

        getLogger().info("=================================================");
        getLogger().info(" AquaWarps v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Warps");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        pendingTeleports.clear();
        tpaRequests.clear();
        getLogger().info("AquaWarps disabled gracefully.");
    }

    public static AquaWarps getInstance() {
        return instance;
    }

    public void scheduleTeleport(Player player, Location target, String locationName) {
        UUID uuid = player.getUniqueId();
        int delay = getConfig().getInt("settings.teleport_delay_seconds", 3);

        if (delay <= 0 || player.hasPermission("aquawarps.bypass.delay")) {
            player.teleportAsync(target);
            player.playSound(player.getLocation(), Sound.ENTITY_ENDERMAN_TELEPORT, 1.0f, 1.2f);
            player.sendMessage(miniMessage.deserialize("<green>Teleported to <gold>" + locationName + "<green>!"));
            return;
        }

        pendingTeleports.add(uuid);
        player.sendMessage(miniMessage.deserialize("<yellow>Teleporting to <gold>" + locationName + " <yellow>in " + delay + " seconds. Do not move!"));

        Bukkit.getScheduler().runTaskLater(this, () -> {
            if (pendingTeleports.remove(uuid) && player.isOnline()) {
                player.teleportAsync(target);
                player.playSound(player.getLocation(), Sound.ENTITY_ENDERMAN_TELEPORT, 1.0f, 1.2f);
                player.sendMessage(miniMessage.deserialize("<green>Teleport complete!"));
            }
        }, delay * 20L);
    }

    @EventHandler
    public void onPlayerMove(PlayerMoveEvent event) {
        if (!getConfig().getBoolean("settings.cancel_on_move", true)) return;
        if (!pendingTeleports.contains(event.getPlayer().getUniqueId())) return;

        if (event.getFrom().getBlockX() != event.getTo().getBlockX() ||
            event.getFrom().getBlockZ() != event.getTo().getBlockZ()) {
            pendingTeleports.remove(event.getPlayer().getUniqueId());
            event.getPlayer().sendMessage(miniMessage.deserialize("<red>Teleport cancelled because you moved!"));
        }
    }

    public void handleSafeRtp(Player player) {
        UUID uuid = player.getUniqueId();
        long cooldown = getConfig().getInt("rtp.cooldown_seconds", 30) * 1000L;
        long lastRtp = rtpCooldowns.getOrDefault(uuid, 0L);

        if (System.currentTimeMillis() - lastRtp < cooldown && !player.hasPermission("aquawarps.bypass.cooldown")) {
            long remaining = (cooldown - (System.currentTimeMillis() - lastRtp)) / 1000;
            player.sendMessage(miniMessage.deserialize("<red>RTP cooldown active! Please wait " + remaining + " seconds."));
            return;
        }

        World world = player.getWorld();
        int minR = getConfig().getInt("rtp.min_radius", 500);
        int maxR = getConfig().getInt("rtp.max_radius", 5000);

        int x = ThreadLocalRandom.current().nextInt(minR, maxR) * (ThreadLocalRandom.current().nextBoolean() ? 1 : -1);
        int z = ThreadLocalRandom.current().nextInt(minR, maxR) * (ThreadLocalRandom.current().nextBoolean() ? 1 : -1);
        int highestY = world.getHighestBlockYAt(x, z);

        Material floor = world.getBlockAt(x, highestY - 1, z).getType();
        if (floor == Material.WATER || floor == Material.LAVA || floor == Material.AIR) {
            // Retry
            x += 50;
            highestY = world.getHighestBlockYAt(x, z);
        }

        Location target = new Location(world, x + 0.5, highestY, z + 0.5, player.getLocation().getYaw(), player.getLocation().getPitch());
        rtpCooldowns.put(uuid, System.currentTimeMillis());
        scheduleTeleport(player, target, "the Wilderness (" + x + ", " + z + ")");
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Console cannot execute teleport commands.");
            return true;
        }

        String name = command.getName().toLowerCase();

        if (name.equals("spawn")) {
            Location target = spawnLocation != null ? spawnLocation : player.getWorld().getSpawnLocation();
            scheduleTeleport(player, target, "Spawn");
            return true;
        }

        if (name.equals("setspawn")) {
            spawnLocation = player.getLocation();
            player.sendMessage(miniMessage.deserialize("<green>Global spawn set to your current location!"));
            return true;
        }

        if (name.equals("rtp")) {
            handleSafeRtp(player);
            return true;
        }

        if (name.equals("sethome")) {
            String homeName = args.length > 0 ? args[0].toLowerCase() : "default";
            playerHomes.computeIfAbsent(player.getUniqueId(), k -> new HashMap<>()).put(homeName, player.getLocation());
            player.sendMessage(miniMessage.deserialize("<green>Home <gold>" + homeName + " <green>has been saved!"));
            return true;
        }

        if (name.equals("home")) {
            String homeName = args.length > 0 ? args[0].toLowerCase() : "default";
            Map<String, Location> homes = playerHomes.get(player.getUniqueId());
            if (homes == null || !homes.containsKey(homeName)) {
                player.sendMessage(miniMessage.deserialize("<red>Home '" + homeName + "' not found. Use /sethome"));
                return true;
            }
            scheduleTeleport(player, homes.get(homeName), "Home '" + homeName + "'");
            return true;
        }

        if (name.equals("tpa")) {
            if (args.length < 1) {
                player.sendMessage(miniMessage.deserialize("<red>Usage: /tpa <player>"));
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target == null || !target.isOnline()) {
                player.sendMessage(miniMessage.deserialize("<red>Target player not found."));
                return true;
            }
            tpaRequests.put(target.getUniqueId(), player.getUniqueId());
            player.sendMessage(miniMessage.deserialize("<yellow>Teleport request sent to <gold>" + target.getName()));
            target.sendMessage(miniMessage.deserialize("<gold>" + player.getName() + " <yellow>wants to teleport to you. Type <green>/tpaccept <yellow>to allow."));
            return true;
        }

        if (name.equals("tpaccept")) {
            UUID senderId = tpaRequests.remove(player.getUniqueId());
            if (senderId == null) {
                player.sendMessage(miniMessage.deserialize("<red>You have no pending teleport requests."));
                return true;
            }
            Player requester = Bukkit.getPlayer(senderId);
            if (requester != null && requester.isOnline()) {
                scheduleTeleport(requester, player.getLocation(), player.getName());
                player.sendMessage(miniMessage.deserialize("<green>Teleport request accepted."));
            }
            return true;
        }

        return false;
    }
}
