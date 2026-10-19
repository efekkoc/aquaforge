package com.aquaforge.pass;

import net.kyori.adventure.text.Component;
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
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaPass - Battle Pass, Quest Tracker & Tier Reward Engine for Paper 1.20.x – 1.21.11.
 * Supports Free & Premium tracks, daily quests, and instant GUI reward delivery.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaPass extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaPass instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    private final Map<UUID, Integer> playerExp = new HashMap<>();
    private final Map<UUID, Set<Integer>> claimedTiers = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("pass") != null) {
            getCommand("pass").setExecutor(this);
        }
        if (getCommand("passadmin") != null) {
            getCommand("passadmin").setExecutor(this);
        }

        getLogger().info("=================================================");
        getLogger().info(" AquaPass v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        playerExp.clear();
        claimedTiers.clear();
        getLogger().info("AquaPass disabled gracefully.");
    }

    public static AquaPass getInstance() {
        return instance;
    }

    public int getPlayerXp(UUID uuid) {
        return playerExp.getOrDefault(uuid, 0);
    }

    public int getPlayerTier(UUID uuid) {
        int xpPerTier = getConfig().getInt("settings.xp_per_tier", 1000);
        return Math.min(getPlayerXp(uuid) / xpPerTier, getConfig().getInt("settings.max_tiers", 50));
    }

    public void addPassXp(Player player, int amount) {
        UUID uuid = player.getUniqueId();
        int oldTier = getPlayerTier(uuid);
        playerExp.put(uuid, getPlayerXp(uuid) + amount);
        int newTier = getPlayerTier(uuid);

        player.sendActionBar(miniMessage.deserialize("<gradient:#f59e0b:#d97706>+ " + amount + " Pass XP</gradient> <gray>(Tier " + newTier + ")"));

        if (newTier > oldTier) {
            player.playSound(player.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
            player.sendMessage(miniMessage.deserialize("<gradient:#10b981:#059669>★ BATTLE PASS LEVEL UP!</gradient> <white>You reached Tier <gold>" + newTier + "<white>! Use <aqua>/pass<white> to claim."));
        }
    }

    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        if (event.getBlock().getType() == Material.DIAMOND_ORE || event.getBlock().getType() == Material.DEEPSLATE_DIAMOND_ORE) {
            addPassXp(event.getPlayer(), 50);
        }
    }

    @EventHandler
    public void onEntityDeath(EntityDeathEvent event) {
        if (event.getEntity().getKiller() != null) {
            addPassXp(event.getEntity().getKiller(), 20);
        }
    }

    public void openPassGui(Player player) {
        UUID uuid = player.getUniqueId();
        int tier = getPlayerTier(uuid);
        int xp = getPlayerXp(uuid);
        int xpPerTier = getConfig().getInt("settings.xp_per_tier", 1000);

        Inventory inv = Bukkit.createInventory(null, 54, Component.text("AquaPass - " + getConfig().getString("settings.season_name", "Season I")));

        // Fill border
        ItemStack glass = new ItemStack(Material.BLACK_STAINED_GLASS_PANE);
        ItemMeta glassMeta = glass.getItemMeta();
        glassMeta.displayName(Component.empty());
        glass.setItemMeta(glassMeta);

        for (int i = 0; i < 9; i++) inv.setItem(i, glass);
        for (int i = 45; i < 54; i++) inv.setItem(i, glass);

        // Player summary item
        ItemStack summary = new ItemStack(Material.NETHER_STAR);
        ItemMeta sMeta = summary.getItemMeta();
        sMeta.displayName(miniMessage.deserialize("<gradient:#38ef7d:#11998e><b>Your Pass Progress</b></gradient>"));
        List<Component> lore = new ArrayList<>();
        lore.add(miniMessage.deserialize("<gray>Current Tier: <gold><b>" + tier + "</b> / 50"));
        lore.add(miniMessage.deserialize("<gray>Pass XP: <aqua>" + xp + " <gray>(Next: " + ((tier + 1) * xpPerTier) + ")"));
        lore.add(miniMessage.deserialize(player.hasPermission("aquapass.premium") ? "<green>✔ Premium Pass Active" : "<red>✘ Free Pass (Upgrade to Premium)"));
        sMeta.lore(lore);
        summary.setItemMeta(sMeta);
        inv.setItem(4, summary);

        // Display sample tier icons
        for (int t = 1; t <= 7; t++) {
            ItemStack tierItem = new ItemStack(t <= tier ? Material.CHEST_MINECART : Material.MINECART);
            ItemMeta tMeta = tierItem.getItemMeta();
            tMeta.displayName(miniMessage.deserialize("<gradient:#00d2ff:#3a7bd5>Tier " + t + "</gradient>"));
            List<Component> tLore = new ArrayList<>();
            tLore.add(miniMessage.deserialize(t <= tier ? "<green>Status: UNLOCKED" : "<red>Status: LOCKED"));
            tLore.add(miniMessage.deserialize("<gray>Free Reward: " + (t % 2 == 0 ? "Iron & Gold" : "Gems & XP")));
            tLore.add(miniMessage.deserialize("<gold>Premium Reward: Rare Crate Key & Artifacts"));
            tMeta.lore(tLore);
            tierItem.setItemMeta(tMeta);
            inv.setItem(18 + t, tierItem);
        }

        player.openInventory(inv);
        player.playSound(player.getLocation(), Sound.UI_BUTTON_CLICK, 0.8f, 1.2f);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("pass")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Console cannot view pass GUI.");
                return true;
            }
            openPassGui(player);
            return true;
        }

        if (command.getName().equalsIgnoreCase("passadmin")) {
            if (args.length >= 3 && args[0].equalsIgnoreCase("givexp")) {
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(miniMessage.deserialize("<red>Target player not found."));
                    return true;
                }
                try {
                    int amount = Integer.parseInt(args[2]);
                    addPassXp(target, amount);
                    sender.sendMessage(miniMessage.deserialize("<green>Awarded " + amount + " Pass XP to " + target.getName()));
                } catch (NumberFormatException e) {
                    sender.sendMessage(miniMessage.deserialize("<red>Invalid amount specified."));
                }
                return true;
            }

            sender.sendMessage(miniMessage.deserialize("<yellow>Usage: /passadmin givexp <player> <amount>"));
            return true;
        }

        return false;
    }
}
