package com.aquaforge.crates;

import org.bukkit.*;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Firework;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.FireworkMeta;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.Arrays;
import java.util.Random;

/**
 * AquaCrates - 3D Particle Animated Loot Crate Engine.
 * Universal support for Paper 1.20.x – 1.21.4 (Optimized for 1.21.1 & 1.21.4).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaCrates extends JavaPlugin implements CommandExecutor {

    private static AquaCrates instance;
    private final Random random = new Random();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        if (getCommand("aquacrates") != null) {
            getCommand("aquacrates").setExecutor(this);
        }

        getLogger().info("=========================================");
        getLogger().info(" AquaCrates v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.4 Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        getLogger().info("AquaCrates disabled cleanly.");
    }

    public static AquaCrates getInstance() {
        return instance;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!sender.hasPermission("aquacrates.admin")) {
            sender.sendMessage(ChatColor.RED + "No permission.");
            return true;
        }

        if (args.length == 0) {
            sender.sendMessage(ChatColor.DARK_AQUA + "AquaCrates Commands: /crates givekey <player> [amount]");
            return true;
        }

        if (args[0].equalsIgnoreCase("givekey")) {
            if (args.length < 2) {
                sender.sendMessage(ChatColor.RED + "Usage: /crates givekey <player> [amount]");
                return true;
            }
            Player target = Bukkit.getPlayer(args[1]);
            if (target == null) {
                sender.sendMessage(ChatColor.RED + "Player not found!");
                return true;
            }
            int amount = args.length >= 3 ? Math.max(1, Integer.parseInt(args[2])) : 1;

            ItemStack key = new ItemStack(Material.TRIPWIRE_HOOK, amount);
            ItemMeta meta = key.getItemMeta();
            if (meta != null) {
                meta.setDisplayName(ChatColor.LIGHT_PURPLE + "" + ChatColor.BOLD + "✦ Mystic Crate Key ✦");
                meta.setLore(Arrays.asList(
                        ChatColor.DARK_GRAY + "Right-click a Mystic Crate to unlock rewards!",
                        ChatColor.AQUA + "AquaForge Crate Matrix"
                ));
                key.setItemMeta(meta);
            }
            target.getInventory().addItem(key);
            target.playSound(target.getLocation(), Sound.BLOCK_AMETHYST_BLOCK_CHIME, 1.0f, 1.2f);
            sender.sendMessage(ChatColor.GREEN + "Gave " + amount + " Mystic Key(s) to " + target.getName());
            return true;
        }

        if (args[0].equalsIgnoreCase("open")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Players only.");
                return true;
            }
            playCrateAnimation(player);
            return true;
        }

        return false;
    }

    public void playCrateAnimation(Player player) {
        Location loc = player.getLocation().add(0, 1.5, 0);

        new BukkitRunnable() {
            int ticks = 0;
            double angle = 0;

            @Override
            public void run() {
                ticks++;
                angle += 0.35;

                // Particle spiral
                double x = Math.cos(angle) * 1.2;
                double z = Math.sin(angle) * 1.2;
                player.getWorld().spawnParticle(Particle.PORTAL, loc.clone().add(x, ticks * 0.05, z), 3, 0, 0, 0, 0.02);
                player.playSound(loc, Sound.BLOCK_NOTE_BLOCK_BELL, 0.6f, 1.0f + (ticks * 0.04f));

                if (ticks >= 20) {
                    cancel();
                    // Finish & Spawn Firework
                    Firework fw = player.getWorld().spawn(loc, Firework.class);
                    FireworkMeta meta = fw.getFireworkMeta();
                    meta.addEffect(FireworkEffect.builder()
                            .with(FireworkEffect.Type.BALL_LARGE)
                            .withColor(Color.PURPLE, Color.AQUA, Color.YELLOW)
                            .withFade(Color.WHITE)
                            .flicker(true)
                            .trail(true)
                            .build());
                    meta.setPower(1);
                    fw.setFireworkMeta(meta);

                    // Reward
                    ItemStack reward = new ItemStack(Material.DIAMOND, 8);
                    player.getInventory().addItem(reward);
                    player.sendMessage(ChatColor.LIGHT_PURPLE + "" + ChatColor.BOLD + "✦ CRATE OPENED! ✦ " +
                            ChatColor.GREEN + "You won 8x Diamonds!");
                    player.playSound(player.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
                }
            }
        }.runTaskTimer(this, 1L, 2L);
    }
}
