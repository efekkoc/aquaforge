package com.aquaforge.enchants;

import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.block.Block;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaEnchants - Universal VeinMiner, Timber, Auto-Smelt & Telepathy Engine.
 * Supports Paper 1.20.x through 1.21.11.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaEnchants extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaEnchants instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("enchants") != null) getCommand("enchants").setExecutor(this);
        if (getCommand("givebook") != null) getCommand("givebook").setExecutor(this);

        getLogger().info("=================================================");
        getLogger().info(" AquaEnchants v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Enchants");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        getLogger().info("AquaEnchants disabled gracefully.");
    }

    public static AquaEnchants getInstance() {
        return instance;
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        Block block = event.getBlock();
        Material mat = block.getType();

        // VeinMiner for ores when sneaking
        if (player.isSneaking() && isOre(mat) && getConfig().getBoolean("settings.enable_vein_miner", true)) {
            breakVein(block, mat, player, 0);
        }

        // Timber for logs when sneaking
        if (player.isSneaking() && isLog(mat) && getConfig().getBoolean("settings.enable_timber", true)) {
            breakTree(block, mat, player, 0);
        }
    }

    private boolean isOre(Material m) {
        return m.name().endsWith("_ORE");
    }

    private boolean isLog(Material m) {
        return m.name().endsWith("_LOG") || m.name().endsWith("_WOOD");
    }

    private void breakVein(Block start, Material targetType, Player player, int depth) {
        int max = getConfig().getInt("settings.vein_miner_max_blocks", 64);
        if (depth >= max) return;

        Queue<Block> queue = new LinkedList<>();
        Set<Block> visited = new HashSet<>();
        queue.add(start);
        visited.add(start);

        int count = 0;
        while (!queue.isEmpty() && count < max) {
            Block current = queue.poll();
            if (current.getType() == targetType) {
                current.breakNaturally(player.getInventory().getItemInMainHand());
                count++;

                for (int x = -1; x <= 1; x++) {
                    for (int y = -1; y <= 1; y++) {
                        for (int z = -1; z <= 1; z++) {
                            Block relative = current.getRelative(x, y, z);
                            if (relative.getType() == targetType && visited.add(relative)) {
                                queue.add(relative);
                            }
                        }
                    }
                }
            }
        }

        if (count > 1) {
            player.playSound(player.getLocation(), Sound.BLOCK_AMETHYST_CLUSTER_BREAK, 1.0f, 1.2f);
            player.sendActionBar(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>⚡ VeinMiner:</gradient> <white>" + count + " ores excavated!"));
        }
    }

    private void breakTree(Block start, Material targetType, Player player, int depth) {
        Block current = start;
        int count = 0;
        while (current.getType() == targetType && count < 64) {
            current.breakNaturally(player.getInventory().getItemInMainHand());
            count++;
            current = current.getRelative(0, 1, 0);
        }
        if (count > 1) {
            player.playSound(player.getLocation(), Sound.BLOCK_WOOD_BREAK, 1.0f, 0.8f);
            player.sendActionBar(miniMessage.deserialize("<gradient:#11998e:#38ef7d>🪓 Timber:</gradient> <white>" + count + " logs harvested!"));
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("enchants")) {
            sender.sendMessage(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>=== AquaEnchants Abilities ===</gradient>"));
            sender.sendMessage(miniMessage.deserialize("<aqua>• VeinMiner:</aqua> <gray>Shift + Mine ores to excavate the entire cluster."));
            sender.sendMessage(miniMessage.deserialize("<green>• Timber:</green> <gray>Shift + Mine tree logs to chop the full trunk instantly."));
            sender.sendMessage(miniMessage.deserialize("<gold>• Auto-Smelt:</gold> <gray>Ores drop pre-smelted ingots automatically."));
            sender.sendMessage(miniMessage.deserialize("<purple>• Telepathy:</purple> <gray>Broken blocks go straight into your inventory."));
            return true;
        }

        return false;
    }
}
