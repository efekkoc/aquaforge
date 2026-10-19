package com.aquaforge.combat;

import net.kyori.adventure.bossbar.BossBar;
import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Bukkit;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.player.PlayerCommandPreprocessEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaCombat - Modern Anti-CombatLog, Dynamic BossBar & PvP Tag Engine.
 * Supports Paper 1.20.x through 1.21.11.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaCombat extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaCombat instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    private final Map<UUID, Long> combatExpiry = new HashMap<>();
    private final Map<UUID, BossBar> combatBossBars = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("combattag") != null) getCommand("combattag").setExecutor(this);

        // Timer to tick boss bars down
        Bukkit.getScheduler().runTaskTimer(this, this::tickCombatStatus, 10L, 10L);

        getLogger().info("=================================================");
        getLogger().info(" AquaCombat v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Combat");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        for (Map.Entry<UUID, BossBar> entry : combatBossBars.entrySet()) {
            Player p = Bukkit.getPlayer(entry.getKey());
            if (p != null) p.hideBossBar(entry.getValue());
        }
        combatBossBars.clear();
        combatExpiry.clear();
        getLogger().info("AquaCombat disabled gracefully.");
    }

    public static AquaCombat getInstance() {
        return instance;
    }

    public boolean isInCombat(UUID uuid) {
        return combatExpiry.containsKey(uuid) && combatExpiry.get(uuid) > System.currentTimeMillis();
    }

    public void tagPlayer(Player player) {
        UUID uuid = player.getUniqueId();
        int durationSec = getConfig().getInt("settings.combat_duration_seconds", 15);
        long expiry = System.currentTimeMillis() + (durationSec * 1000L);

        boolean wasInCombat = isInCombat(uuid);
        combatExpiry.put(uuid, expiry);

        BossBar bar = combatBossBars.computeIfAbsent(uuid, k -> {
            BossBar newBar = BossBar.bossBar(
                    miniMessage.deserialize("<gradient:#ff416c:#ff4b2b>⚔ IN COMBAT</gradient>"),
                    1.0f,
                    BossBar.Color.RED,
                    BossBar.Overlay.NOTCHED_10
            );
            player.showBossBar(newBar);
            return newBar;
        });

        if (!wasInCombat) {
            player.playSound(player.getLocation(), Sound.ENTITY_ENDER_DRAGON_GROWL, 0.6f, 1.6f);
            player.sendMessage(miniMessage.deserialize("<gradient:#ff416c:#ff4b2b>⚔ YOU ARE IN COMBAT!</gradient> <red>Do not log out or your items will drop!"));
        }
    }

    private void tickCombatStatus() {
        long now = System.currentTimeMillis();
        int maxDuration = getConfig().getInt("settings.combat_duration_seconds", 15);

        Iterator<Map.Entry<UUID, Long>> it = combatExpiry.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<UUID, Long> entry = it.next();
            UUID uuid = entry.getKey();
            long expiry = entry.getValue();
            Player player = Bukkit.getPlayer(uuid);

            if (now >= expiry || player == null || !player.isOnline()) {
                it.remove();
                BossBar bar = combatBossBars.remove(uuid);
                if (bar != null && player != null) {
                    player.hideBossBar(bar);
                    player.sendMessage(miniMessage.deserialize("<gradient:#38ef7d:#11998e>✔ COMBAT EXPIRED</gradient> <gray>You are now safe."));
                    player.playSound(player.getLocation(), Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 0.8f, 1.2f);
                }
            } else {
                long remainingMillis = expiry - now;
                float progress = Math.max(0.0f, Math.min(1.0f, (float) remainingMillis / (maxDuration * 1000f)));
                int remainingSec = (int) Math.ceil(remainingMillis / 1000.0);

                BossBar bar = combatBossBars.get(uuid);
                if (bar != null) {
                    bar.progress(progress);
                    bar.name(miniMessage.deserialize("<gradient:#ff416c:#ff4b2b>⚔ IN COMBAT</gradient> <gray>(" + remainingSec + "s remaining)"));
                }
            }
        }
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onDamage(EntityDamageByEntityEvent event) {
        if (event.getEntity() instanceof Player victim && event.getDamager() instanceof Player attacker) {
            tagPlayer(victim);
            tagPlayer(attacker);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onCommandPreprocess(PlayerCommandPreprocessEvent event) {
        Player player = event.getPlayer();
        if (!isInCombat(player.getUniqueId()) || player.hasPermission("aquacombat.bypass")) return;

        String cmd = event.getMessage().substring(1).split(" ")[0].toLowerCase();
        List<String> blocked = getConfig().getStringList("blocked_commands_during_combat");

        if (blocked.contains(cmd)) {
            event.setCancelled(true);
            player.sendMessage(miniMessage.deserialize("<red>You cannot use /" + cmd + " while in combat!"));
            player.playSound(player.getLocation(), Sound.ENTITY_VILLAGER_NO, 1.0f, 1.0f);
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        if (isInCombat(player.getUniqueId()) && getConfig().getBoolean("settings.kill_on_combat_quit", true)) {
            player.setHealth(0.0);
            Bukkit.broadcast(miniMessage.deserialize(
                    "<gradient:#ff416c:#ff4b2b>☠ COMBAT LOGGED!</gradient> <gold>" + player.getName() + " <red>rage-quit during combat and was eliminated!"
            ));
        }
        BossBar bar = combatBossBars.remove(player.getUniqueId());
        if (bar != null) player.hideBossBar(bar);
        combatExpiry.remove(player.getUniqueId());
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("combattag")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Console is not in combat.");
                return true;
            }

            if (isInCombat(player.getUniqueId())) {
                long remaining = (combatExpiry.get(player.getUniqueId()) - System.currentTimeMillis()) / 1000;
                player.sendMessage(miniMessage.deserialize("<red>You are in combat! Remaining: <gold>" + remaining + " seconds."));
            } else {
                player.sendMessage(miniMessage.deserialize("<green>You are currently not in combat."));
            }
            return true;
        }

        return false;
    }
}
