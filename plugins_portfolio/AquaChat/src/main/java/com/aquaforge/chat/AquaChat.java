package com.aquaforge.chat;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.serializer.legacy.LegacyComponentSerializer;
import org.bukkit.Bukkit;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import io.papermc.paper.event.player.AsyncChatEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * AquaChat - Universal RGB Gradient Chat, Channel Switcher & Hoverable Item Engine.
 * Supports Paper 1.20.x through 1.21.11 (Native Paper AsyncChatEvent & Kyori Adventure).
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaChat extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaChat instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();
    private final Map<UUID, String> playerChannels = new HashMap<>();
    private final Map<UUID, Long> chatCooldowns = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("channel") != null) {
            getCommand("channel").setExecutor(this);
        }
        if (getCommand("item") != null) {
            getCommand("item").setExecutor(this);
        }

        getLogger().info("=================================================");
        getLogger().info(" AquaChat v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Adventure");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        playerChannels.clear();
        chatCooldowns.clear();
        getLogger().info("AquaChat disabled gracefully.");
    }

    public static AquaChat getInstance() {
        return instance;
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onAsyncChat(AsyncChatEvent event) {
        Player player = event.getPlayer();
        UUID uuid = player.getUniqueId();

        // Cooldown check
        if (!player.hasPermission("aquachat.bypass.cooldown")) {
            long lastChat = chatCooldowns.getOrDefault(uuid, 0L);
            long cooldownMillis = (long) (getConfig().getDouble("cooldown.chat_cooldown_seconds", 1.5) * 1000);
            if (System.currentTimeMillis() - lastChat < cooldownMillis) {
                event.setCancelled(true);
                player.sendMessage(miniMessage.deserialize("<gradient:#ff416c:#ff4b2b>Slow down!</gradient> <gray>You are typing too fast."));
                return;
            }
            chatCooldowns.put(uuid, System.currentTimeMillis());
        }

        String channel = playerChannels.getOrDefault(uuid, "global");

        // Format message
        String rawMessage = LegacyComponentSerializer.legacySection().serialize(event.message());
        
        // Mention ping check
        for (Player online : Bukkit.getOnlinePlayers()) {
            if (rawMessage.toLowerCase().contains(online.getName().toLowerCase())) {
                online.playSound(online.getLocation(), Sound.BLOCK_NOTE_BLOCK_BELL, 1.0f, 1.5f);
            }
        }

        if (channel.equalsIgnoreCase("staff")) {
            event.setCancelled(true);
            Component staffFormatted = miniMessage.deserialize(
                    "<gradient:#ff416c:#ff4b2b>[Staff]</gradient> <red>" + player.getName() + " &8» <white>" + rawMessage
            );
            for (Player staff : Bukkit.getOnlinePlayers()) {
                if (staff.hasPermission("aquachat.staffchat")) {
                    staff.sendMessage(staffFormatted);
                }
            }
            return;
        }

        if (channel.equalsIgnoreCase("local")) {
            event.setCancelled(true);
            Component localFormatted = miniMessage.deserialize(
                    "<gradient:#11998e:#38ef7d>[Local]</gradient> <gray>" + player.getName() + " &8» <white>" + rawMessage
            );
            int radius = getConfig().getInt("channels.local.radius", 100);
            int radiusSquared = radius * radius;
            for (Player target : Bukkit.getOnlinePlayers()) {
                if (target.getWorld().equals(player.getWorld()) && target.getLocation().distanceSquared(player.getLocation()) <= radiusSquared) {
                    target.sendMessage(localFormatted);
                }
            }
            return;
        }

        // Global chat with modern gradient
        Component globalPrefix = miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>[Global]</gradient> <gray>" + player.getName() + " &8» <white>");
        event.renderer((source, displayName, message, viewer) -> globalPrefix.append(message));
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Console cannot toggle chat channels.");
            return true;
        }

        if (command.getName().equalsIgnoreCase("channel")) {
            if (args.length == 0) {
                player.sendMessage(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>AquaChat</gradient> <gray>Channels: <aqua>/ch global<gray>, <green>/ch local<gray>, <red>/ch staff"));
                return true;
            }

            String targetChannel = args[0].toLowerCase();
            if (targetChannel.equals("staff") && !player.hasPermission("aquachat.staffchat")) {
                player.sendMessage(miniMessage.deserialize("<red>You do not have permission to access staff chat."));
                return true;
            }

            if (targetChannel.equals("global") || targetChannel.equals("local") || targetChannel.equals("staff")) {
                playerChannels.put(player.getUniqueId(), targetChannel);
                player.sendMessage(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>AquaChat</gradient> <green>Switched to channel <white>" + targetChannel.toUpperCase()));
            } else {
                player.sendMessage(miniMessage.deserialize("<red>Unknown channel! Use global, local, or staff."));
            }
            return true;
        }

        if (command.getName().equalsIgnoreCase("item")) {
            ItemStack held = player.getInventory().getItemInMainHand();
            if (held.isEmpty()) {
                player.sendMessage(miniMessage.deserialize("<red>You are not holding any item to showcase."));
                return true;
            }

            Component itemComponent = miniMessage.deserialize(
                    "<gradient:#00d2ff:#3a7bd5>[Item]</gradient> <yellow>" + player.getName() + " <gray>is showing: <white>" + held.getType().name() + " x" + held.getAmount()
            );
            Bukkit.broadcast(itemComponent);
            return true;
        }

        return false;
    }
}
