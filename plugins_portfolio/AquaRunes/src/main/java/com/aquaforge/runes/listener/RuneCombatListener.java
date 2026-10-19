package com.aquaforge.runes.listener;

import com.aquaforge.runes.AquaRunes;
import com.aquaforge.runes.model.RuneType;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.util.Vector;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Combat & Dynamic Particle Trigger Engine.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class RuneCombatListener implements Listener {

    private final AquaRunes plugin;
    private final Random random = new Random();
    private final Map<UUID, Long> phoenixCooldowns = new HashMap<>();

    public RuneCombatListener(AquaRunes plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onCombatHit(EntityDamageByEntityEvent event) {
        if (!(event.getDamager() instanceof Player attacker)) return;
        if (!(event.getEntity() instanceof LivingEntity victim)) return;

        ItemStack weapon = attacker.getInventory().getItemInMainHand();
        RuneType weaponRune = plugin.getItemFactory().getSocketedRune(weapon);

        if (weaponRune != null) {
            handleWeaponRune(attacker, victim, weaponRune, event);
        }

        // Check Armor Runes on victim
        if (victim instanceof Player victimPlayer) {
            handleArmorRunes(attacker, victimPlayer, event);
        }
    }

    private void handleWeaponRune(Player attacker, LivingEntity victim, RuneType rune, EntityDamageByEntityEvent event) {
        Location victimLoc = victim.getLocation();

        switch (rune) {
            case LIFESTEAL -> {
                double stealAmount = event.getFinalDamage() * 0.25;
                double maxHp = attacker.getAttribute(Attribute.GENERIC_MAX_HEALTH) != null 
                        ? attacker.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue() : 20.0;
                attacker.setHealth(Math.min(maxHp, attacker.getHealth() + stealAmount));
                
                attacker.getWorld().spawnParticle(Particle.HEART, attacker.getLocation().add(0, 1.2, 0), 4, 0.3, 0.3, 0.3);
                attacker.playSound(attacker.getLocation(), Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 0.7f, 1.5f);
            }
            case THUNDERSTRIKE -> {
                if (random.nextDouble() < 0.25) {
                    victim.getWorld().strikeLightningEffect(victimLoc);
                    event.setDamage(event.getDamage() + 4.0);
                    victim.getWorld().spawnParticle(Particle.ELECTRIC_SPARK, victimLoc.add(0, 1, 0), 20, 0.5, 0.5, 0.5);
                    victim.playSound(victimLoc, Sound.ENTITY_LIGHTNING_BOLT_THUNDER, 0.8f, 1.2f);
                }
            }
            case WIND_BURST -> {
                Vector dir = attacker.getLocation().getDirection().normalize();
                victim.setVelocity(dir.clone().multiply(0.9).setY(0.4));
                victim.getWorld().spawnParticle(Particle.GUST, victimLoc.add(0, 0.5, 0), 12, 0.4, 0.4, 0.4);
                attacker.playSound(attacker.getLocation(), Sound.ENTITY_BREEZE_SHOOT, 1.0f, 1.1f);
            }
            case FROZEN_BLADE -> {
                victim.addPotionEffect(new PotionEffect(PotionEffectType.SLOWNESS, 70, 2, false, true));
                victim.getWorld().spawnParticle(Particle.SNOWFLAKE, victimLoc.add(0, 1, 0), 25, 0.4, 0.8, 0.4);
                victim.playSound(victimLoc, Sound.BLOCK_GLASS_BREAK, 0.8f, 1.4f);
            }
            default -> {}
        }
    }

    private void handleArmorRunes(Player attacker, Player victim, EntityDamageByEntityEvent event) {
        // Check Chestplate for Titan Rune
        ItemStack chest = victim.getInventory().getChestplate();
        RuneType chestRune = plugin.getItemFactory().getSocketedRune(chest);

        if (chestRune == RuneType.TITAN) {
            double reflected = event.getDamage() * 0.20;
            attacker.damage(reflected);
            victim.getWorld().spawnParticle(Particle.CRIT, victim.getLocation().add(0, 1, 0), 15, 0.4, 0.4, 0.4);
            victim.playSound(victim.getLocation(), Sound.ITEM_SHIELD_BLOCK, 0.9f, 0.9f);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onFatalDamage(EntityDamageEvent event) {
        if (!(event.getEntity() instanceof Player player)) return;

        if (player.getHealth() - event.getFinalDamage() <= 0) {
            // Check all equipped armor for Phoenix Rune
            boolean hasPhoenix = false;
            for (ItemStack armor : player.getInventory().getArmorContents()) {
                if (plugin.getItemFactory().getSocketedRune(armor) == RuneType.PHOENIX) {
                    hasPhoenix = true;
                    break;
                }
            }

            if (!hasPhoenix) return;

            long now = System.currentTimeMillis();
            long lastUsed = phoenixCooldowns.getOrDefault(player.getUniqueId(), 0L);
            long cooldownMillis = 5 * 60 * 1000L;

            if (now - lastUsed >= cooldownMillis) {
                event.setCancelled(true);
                phoenixCooldowns.put(player.getUniqueId(), now);

                double maxHp = player.getAttribute(Attribute.GENERIC_MAX_HEALTH) != null 
                        ? player.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue() : 20.0;
                player.setHealth(maxHp);
                player.addPotionEffect(new PotionEffect(PotionEffectType.FIRE_RESISTANCE, 20 * 45, 0));
                player.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, 20 * 10, 1));

                Location loc = player.getLocation();
                loc.getWorld().spawnParticle(Particle.FLAME, loc.add(0, 1, 0), 60, 0.6, 1.2, 0.6, 0.08);
                loc.getWorld().playSound(loc, Sound.ITEM_TOTEM_USE, 1.0f, 1.0f);

                player.sendMessage(ChatColor.GOLD + "" + ChatColor.BOLD + "✦ PHOENIX REBIRTH! ✦ Your Phoenix Rune saved you from death!");
            }
        }
    }
}
