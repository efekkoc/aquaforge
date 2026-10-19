package com.aquaforge.skills;

import net.md_5.bungee.api.ChatMessageType;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * AquaSkills - MMO RPG Skill Progression & Ability Engine.
 * Universal support for Paper 1.20.x – 1.21.11 (Optimized for 1.21.1, 1.21.4 & 1.21.11 Mounts of Mayhem).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaSkills extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaSkills instance;
    // UUID -> Skill -> XP
    private final Map<UUID, Map<String, Integer>> playerXp = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("skills") != null) getCommand("skills").setExecutor(this);
        if (getCommand("aquaskills") != null) getCommand("aquaskills").setExecutor(this);

        getLogger().info("=========================================");
        getLogger().info(" AquaSkills v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.11 Mounts of Mayhem Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        playerXp.clear();
    }

    public static AquaSkills getInstance() {
        return instance;
    }

    public int getXp(UUID uuid, String skill) {
        return playerXp.computeIfAbsent(uuid, k -> new HashMap<>()).getOrDefault(skill, 0);
    }

    public int getLevel(int xp) {
        return Math.max(1, (int) Math.sqrt(xp / 100.0) + 1);
    }

    public void addXp(Player player, String skill, int amount) {
        int current = getXp(player.getUniqueId(), skill);
        int oldLevel = getLevel(current);
        int newXp = current + amount;
        playerXp.get(player.getUniqueId()).put(skill, newXp);

        int newLevel = getLevel(newXp);
        if (newLevel > oldLevel) {
            player.sendTitle(ChatColor.GOLD + "" + ChatColor.BOLD + "LEVEL UP!",
                    ChatColor.YELLOW + skill.toUpperCase() + " Level " + newLevel, 10, 40, 10);
            player.playSound(player.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.2f);
        } else {
            // Action bar notification
            player.spigot().sendMessage(ChatMessageType.ACTION_BAR,
                    new TextComponent(ChatColor.AQUA + "+" + amount + " " + skill.toUpperCase() + " XP " +
                            ChatColor.DARK_GRAY + "[Lvl " + newLevel + "]"));
        }
    }

    @EventHandler
    public void onMine(BlockBreakEvent event) {
        Player player = event.getPlayer();
        Material mat = event.getBlock().getType();

        int gain = 0;
        if (mat == Material.STONE || mat == Material.DEEPSLATE) gain = 2;
        else if (mat == Material.IRON_ORE || mat == Material.DEEPSLATE_IRON_ORE) gain = 10;
        else if (mat == Material.DIAMOND_ORE || mat == Material.DEEPSLATE_DIAMOND_ORE) gain = 45;
        else if (mat == Material.ANCIENT_DEBRIS) gain = 100;

        if (gain > 0) {
            addXp(player, "Mining", gain);

            // Double drop chance based on level
            int level = getLevel(getXp(player.getUniqueId(), "Mining"));
            double doubleDropChance = level * 0.5; // 0.5% per level
            if (Math.random() * 100 < doubleDropChance) {
                event.getBlock().getWorld().dropItemNaturally(event.getBlock().getLocation(), new ItemStack(mat));
                player.playSound(player.getLocation(), Sound.ENTITY_ITEM_PICKUP, 0.5f, 1.5f);
            }
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Players only.");
            return true;
        }

        int miningXp = getXp(player.getUniqueId(), "Mining");
        int combatXp = getXp(player.getUniqueId(), "Combat");

        player.sendMessage(ChatColor.DARK_AQUA + "=========== " + ChatColor.AQUA + "Your AquaSkills Profile" + ChatColor.DARK_AQUA + " ===========");
        player.sendMessage(ChatColor.YELLOW + "⛏ Mining: " + ChatColor.WHITE + "Level " + getLevel(miningXp) + ChatColor.DARK_GRAY + " (" + miningXp + " XP)");
        player.sendMessage(ChatColor.RED + "⚔ Combat: " + ChatColor.WHITE + "Level " + getLevel(combatXp) + ChatColor.DARK_GRAY + " (" + combatXp + " XP)");
        player.sendMessage(ChatColor.DARK_AQUA + "=====================================================");
        return true;
    }
}
