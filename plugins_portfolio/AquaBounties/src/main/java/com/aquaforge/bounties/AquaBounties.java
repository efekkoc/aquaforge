package com.aquaforge.bounties;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.SkullMeta;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaBounties - Universal Player Head Bounty, Tracker Compass & PvP Rivalry Engine.
 * Supports Paper 1.20.x through 1.21.11.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaBounties extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaBounties instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();
    private final Map<UUID, Double> bounties = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("bounty") != null) getCommand("bounty").setExecutor(this);
        if (getCommand("hunter") != null) getCommand("hunter").setExecutor(this);

        getLogger().info("=================================================");
        getLogger().info(" AquaBounties v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Bounties");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        bounties.clear();
        getLogger().info("AquaBounties disabled gracefully.");
    }

    public static AquaBounties getInstance() {
        return instance;
    }

    public double getBounty(UUID uuid) {
        return bounties.getOrDefault(uuid, 0.0);
    }

    public void addBounty(UUID uuid, double amount) {
        bounties.put(uuid, getBounty(uuid) + amount);
    }

    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        Player killer = victim.getKiller();

        if (killer != null && !killer.equals(victim)) {
            double reward = bounties.remove(victim.getUniqueId());
            if (reward > 0) {
                killer.playSound(killer.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
                Bukkit.broadcast(miniMessage.deserialize(
                        "<gradient:#ff416c:#ff4b2b>⚔ BOUNTY CLAIMED!</gradient> <gold>" + killer.getName() + 
                        " <white>claimed the <green>$" + String.format("%.2f", reward) + " <white>bounty on <red>" + victim.getName() + "!"
                ));

                if (getConfig().getBoolean("settings.drop_victim_skull_on_kill", true)) {
                    ItemStack skull = new ItemStack(Material.PLAYER_HEAD);
                    SkullMeta meta = (SkullMeta) skull.getItemMeta();
                    meta.setOwningPlayer(victim);
                    meta.displayName(miniMessage.deserialize("<red>Trophy Head: " + victim.getName()));
                    skull.setItemMeta(meta);
                    victim.getWorld().dropItemNaturally(victim.getLocation(), skull);
                }
            }
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("bounty")) {
            if (args.length == 0 || args[0].equalsIgnoreCase("top")) {
                sender.sendMessage(miniMessage.deserialize("<gradient:#ff416c:#ff4b2b>=== ACTIVE BOUNTIES ===</gradient>"));
                if (bounties.isEmpty()) {
                    sender.sendMessage(miniMessage.deserialize("<gray>No active bounties currently placed."));
                } else {
                    bounties.entrySet().stream()
                            .sorted(Map.Entry.<UUID, Double>comparingByValue().reversed())
                            .limit(5)
                            .forEach(e -> {
                                Player p = Bukkit.getPlayer(e.getKey());
                                String name = p != null ? p.getName() : "Unknown (" + e.getKey().toString().substring(0, 8) + ")";
                                sender.sendMessage(miniMessage.deserialize("<gold>• <red>" + name + " <gray>» <green>$" + String.format("%.2f", e.getValue())));
                            });
                }
                return true;
            }

            if (args[0].equalsIgnoreCase("set") && args.length >= 3) {
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(miniMessage.deserialize("<red>Target player not found or offline."));
                    return true;
                }

                try {
                    double amount = Double.parseDouble(args[2]);
                    double min = getConfig().getDouble("settings.minimum_bounty", 100.0);
                    if (amount < min) {
                        sender.sendMessage(miniMessage.deserialize("<red>Minimum bounty amount is $" + min));
                        return true;
                    }

                    addBounty(target.getUniqueId(), amount);
                    Bukkit.broadcast(miniMessage.deserialize(
                            "<gradient:#ff416c:#ff4b2b>🎯 BOUNTY PLACED!</gradient> <gold>" + sender.getName() + 
                            " <white>placed a <green>$" + amount + " <white>bounty on <red>" + target.getName() + "!"
                    ));
                } catch (NumberFormatException e) {
                    sender.sendMessage(miniMessage.deserialize("<red>Invalid amount specified."));
                }
                return true;
            }
        }

        if (command.getName().equalsIgnoreCase("hunter")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Console cannot use tracking compass.");
                return true;
            }

            ItemStack compass = new ItemStack(Material.COMPASS);
            player.getInventory().addItem(compass);
            player.sendMessage(miniMessage.deserialize("<green>Received Hunter Compass! Points towards closest bountied target."));
            player.playSound(player.getLocation(), Sound.ITEM_LODESTONE_COMPASS_LOCK, 1.0f, 1.2f);
            return true;
        }

        return false;
    }
}
