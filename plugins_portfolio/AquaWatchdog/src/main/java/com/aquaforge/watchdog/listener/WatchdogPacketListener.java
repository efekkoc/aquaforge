package com.aquaforge.watchdog.listener;

import com.aquaforge.watchdog.AquaWatchdog;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.player.PlayerAnimationEvent;
import org.bukkit.event.player.PlayerAnimationType;
import org.bukkit.event.player.PlayerQuitEvent;

/**
 * Event Listener intercepting combat and arm animations.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class WatchdogPacketListener implements Listener {

    private final AquaWatchdog plugin;

    public WatchdogPacketListener(AquaWatchdog plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onArmSwing(PlayerAnimationEvent event) {
        if (event.getAnimationType() == PlayerAnimationType.ARM_SWING) {
            plugin.getCpsCheck().recordClick(event.getPlayer());
        }
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onAttack(EntityDamageByEntityEvent event) {
        if (event.getDamager() instanceof Player attacker) {
            boolean shouldCancel = plugin.getReachCheck().inspectAttack(attacker, event.getEntity());
            if (shouldCancel) {
                event.setCancelled(true);
            }
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        plugin.getCpsCheck().clear(event.getPlayer().getUniqueId());
    }
}
