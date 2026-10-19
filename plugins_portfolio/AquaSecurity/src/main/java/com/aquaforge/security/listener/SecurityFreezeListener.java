package com.aquaforge.security.listener;

import com.aquaforge.security.AquaSecurity;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.player.*;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.List;

/**
 * High-Security Lockdown Listener.
 * Enforces comprehensive lockdown of unauthenticated accounts.
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class SecurityFreezeListener implements Listener {

    private final AquaSecurity plugin;

    public SecurityFreezeListener(AquaSecurity plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String ip = player.getAddress() != null ? player.getAddress().getAddress().getHostAddress() : "";

        boolean has2fa = plugin.has2faEnabled(player.getUniqueId());
        boolean forceOp = plugin.getConfig().getBoolean("force-op-2fa", true) && player.isOp();
        boolean requirePerm = player.hasPermission("aquasecurity.require2fa");
        boolean bypass = player.hasPermission("aquasecurity.bypass");

        if (bypass) {
            return;
        }

        if (has2fa || forceOp || requirePerm) {
            // Check session IP cache
            if (plugin.hasActiveSession(player.getUniqueId(), ip)) {
                player.sendMessage(ChatColor.translateAlternateColorCodes('&',
                        plugin.getConfig().getString("messages.prefix") + "&aSession recognized (" + ip + "). Welcome back!"));
                return;
            }

            // Lock player down
            plugin.freezePlayer(player.getUniqueId());

            if (plugin.getConfig().getBoolean("restrictions.blindness-effect", true)) {
                player.addPotionEffect(new PotionEffect(PotionEffectType.BLINDNESS, 20 * 180, 2, false, false));
            }

            // Repeating reminder & timeout scheduler
            int timeoutSeconds = plugin.getConfig().getInt("auth-timeout-seconds", 120);

            new BukkitRunnable() {
                int elapsed = 0;

                @Override
                public void run() {
                    if (!player.isOnline() || !plugin.isFrozen(player.getUniqueId())) {
                        cancel();
                        return;
                    }

                    if (elapsed >= timeoutSeconds) {
                        player.kickPlayer(ChatColor.translateAlternateColorCodes('&',
                                plugin.getConfig().getString("messages.timeout-kick")));
                        cancel();
                        return;
                    }

                    if (elapsed % 6 == 0) {
                        if (plugin.has2faEnabled(player.getUniqueId())) {
                            player.sendMessage(ChatColor.translateAlternateColorCodes('&',
                                    plugin.getConfig().getString("messages.prefix") +
                                            plugin.getConfig().getString("messages.prompt-verify")));
                        } else {
                            player.sendMessage(ChatColor.translateAlternateColorCodes('&',
                                    plugin.getConfig().getString("messages.prefix") +
                                            plugin.getConfig().getString("messages.prompt-setup")));
                        }
                    }

                    elapsed += 2;
                }
            }.runTaskTimer(plugin, 10L, 40L);
        }
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        plugin.unfreezePlayer(event.getPlayer().getUniqueId(), null);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onMove(PlayerMoveEvent event) {
        if (!plugin.isFrozen(event.getPlayer().getUniqueId())) return;

        Location from = event.getFrom();
        Location to = event.getTo();
        if (to == null) return;

        // Allow looking around (pitch/yaw), block coordinate translation
        if (from.getX() != to.getX() || from.getY() != to.getY() || from.getZ() != to.getZ()) {
            event.setTo(from);
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onCommandPreprocess(PlayerCommandPreprocessEvent event) {
        if (!plugin.isFrozen(event.getPlayer().getUniqueId())) return;

        String message = event.getMessage().toLowerCase();
        List<String> allowed = plugin.getConfig().getStringList("allowed-commands");

        boolean isAllowed = false;
        for (String cmd : allowed) {
            if (message.startsWith("/" + cmd.toLowerCase())) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(ChatColor.RED + "You must authenticate with /2fa before using commands!");
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onChat(AsyncPlayerChatEvent event) {
        if (plugin.isFrozen(event.getPlayer().getUniqueId())) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(ChatColor.RED + "Chat is disabled until you authenticate with 2FA!");
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onBlockBreak(BlockBreakEvent event) {
        if (plugin.isFrozen(event.getPlayer().getUniqueId())) event.setCancelled(true);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onBlockPlace(BlockPlaceEvent event) {
        if (plugin.isFrozen(event.getPlayer().getUniqueId())) event.setCancelled(true);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onInteract(PlayerInteractEvent event) {
        if (plugin.isFrozen(event.getPlayer().getUniqueId())) event.setCancelled(true);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getWhoClicked() instanceof Player player) {
            if (plugin.isFrozen(player.getUniqueId())) event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onDropItem(PlayerDropItemEvent event) {
        if (plugin.isFrozen(event.getPlayer().getUniqueId())) event.setCancelled(true);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onDamage(EntityDamageEvent event) {
        if (event.getEntity() instanceof Player player) {
            if (plugin.isFrozen(player.getUniqueId())) event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onDamageOther(EntityDamageByEntityEvent event) {
        if (event.getDamager() instanceof Player player) {
            if (plugin.isFrozen(player.getUniqueId())) event.setCancelled(true);
        }
    }
}
