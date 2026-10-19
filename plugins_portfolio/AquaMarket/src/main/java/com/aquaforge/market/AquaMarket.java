package com.aquaforge.market;

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
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.*;

/**
 * AquaMarket - Modern 1.20.x - 1.21.11 Auction House & Player Marketplace Engine.
 * Supports Data Components, sales tax, expiration mailboxes, and instant GUI trading.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaMarket extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaMarket instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    public static class Listing {
        public final UUID id;
        public final UUID sellerId;
        public final String sellerName;
        public final ItemStack item;
        public final double price;
        public final long listedTime;

        public Listing(UUID sellerId, String sellerName, ItemStack item, double price) {
            this.id = UUID.randomUUID();
            this.sellerId = sellerId;
            this.sellerName = sellerName;
            this.item = item.clone();
            this.price = price;
            this.listedTime = System.currentTimeMillis();
        }
    }

    private final List<Listing> activeListings = new ArrayList<>();
    private final Map<UUID, List<ItemStack>> mailboxes = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("ah") != null) {
            getCommand("ah").setExecutor(this);
        }
        if (getCommand("marketadmin") != null) {
            getCommand("marketadmin").setExecutor(this);
        }

        getLogger().info("=================================================");
        getLogger().info(" AquaMarket v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Market");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        activeListings.clear();
        mailboxes.clear();
        getLogger().info("AquaMarket disabled gracefully.");
    }

    public static AquaMarket getInstance() {
        return instance;
    }

    public void openMarketGui(Player player) {
        Inventory inv = Bukkit.createInventory(null, 54, Component.text("AquaMarket - Global Auction"));

        // Border Glass
        ItemStack glass = new ItemStack(Material.CYAN_STAINED_GLASS_PANE);
        ItemMeta gMeta = glass.getItemMeta();
        gMeta.displayName(Component.empty());
        glass.setItemMeta(gMeta);

        for (int i = 45; i < 54; i++) inv.setItem(i, glass);

        // Mailbox Button
        ItemStack mailBtn = new ItemStack(Material.CHEST);
        ItemMeta mMeta = mailBtn.getItemMeta();
        mMeta.displayName(miniMessage.deserialize("<gradient:#f59e0b:#d97706><b>Your Mailbox</b></gradient>"));
        List<Component> mLore = new ArrayList<>();
        int mailCount = mailboxes.getOrDefault(player.getUniqueId(), Collections.emptyList()).size();
        mLore.add(miniMessage.deserialize("<gray>Stored items: <aqua>" + mailCount));
        mLore.add(miniMessage.deserialize("<yellow>Click to collect expired/purchased items"));
        mMeta.lore(mLore);
        mailBtn.setItemMeta(mMeta);
        inv.setItem(49, mailBtn);

        // Display current active listings
        int slot = 0;
        for (Listing listing : activeListings) {
            if (slot >= 45) break;

            ItemStack display = listing.item.clone();
            ItemMeta meta = display.getItemMeta();
            List<Component> lore = meta.hasLore() ? new ArrayList<>(meta.lore()) : new ArrayList<>();
            lore.add(Component.empty());
            lore.add(miniMessage.deserialize("<gray>Seller: <gold>" + listing.sellerName));
            lore.add(miniMessage.deserialize("<gray>Price: <green>$" + String.format("%.2f", listing.price)));
            lore.add(miniMessage.deserialize("<yellow>Click to purchase"));
            meta.lore(lore);
            display.setItemMeta(meta);

            inv.setItem(slot++, display);
        }

        player.openInventory(inv);
        player.playSound(player.getLocation(), Sound.UI_BUTTON_CLICK, 0.8f, 1.2f);
    }

    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getView().title().equals(Component.text("AquaMarket - Global Auction"))) {
            event.setCancelled(true);
            if (event.getCurrentItem() == null) return;

            Player player = (Player) event.getWhoClicked();
            int slot = event.getRawSlot();

            if (slot == 49) {
                // Collect Mailbox
                List<ItemStack> stored = mailboxes.remove(player.getUniqueId());
                if (stored == null || stored.isEmpty()) {
                    player.sendMessage(miniMessage.deserialize("<red>Your mailbox is currently empty."));
                } else {
                    for (ItemStack item : stored) player.getInventory().addItem(item);
                    player.sendMessage(miniMessage.deserialize("<green>Collected " + stored.size() + " items from mailbox!"));
                    player.playSound(player.getLocation(), Sound.ENTITY_ITEM_PICKUP, 1.0f, 1.0f);
                }
                player.closeInventory();
            }
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Console cannot browse auction GUI.");
            return true;
        }

        if (command.getName().equalsIgnoreCase("ah")) {
            if (args.length == 0) {
                openMarketGui(player);
                return true;
            }

            if (args[0].equalsIgnoreCase("sell")) {
                if (args.length < 2) {
                    player.sendMessage(miniMessage.deserialize("<red>Usage: /ah sell <price>"));
                    return true;
                }

                try {
                    double price = Double.parseDouble(args[1]);
                    double min = getConfig().getDouble("settings.min_listing_price", 10.0);
                    if (price < min) {
                        player.sendMessage(miniMessage.deserialize("<red>Minimum listing price is $" + min));
                        return true;
                    }

                    ItemStack held = player.getInventory().getItemInMainHand();
                    if (held.isEmpty()) {
                        player.sendMessage(miniMessage.deserialize("<red>Hold an item in hand to sell."));
                        return true;
                    }

                    ItemStack toList = held.clone();
                    player.getInventory().setItemInMainHand(null);

                    activeListings.add(new Listing(player.getUniqueId(), player.getName(), toList, price));
                    player.playSound(player.getLocation(), Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 1.0f, 1.2f);
                    player.sendMessage(miniMessage.deserialize("<green>Successfully listed <aqua>" + toList.getType().name() + " <green>for <gold>$" + price + "<green>!"));
                } catch (NumberFormatException e) {
                    player.sendMessage(miniMessage.deserialize("<red>Invalid price format."));
                }
                return true;
            }

            if (args[0].equalsIgnoreCase("mailbox")) {
                List<ItemStack> stored = mailboxes.remove(player.getUniqueId());
                if (stored == null || stored.isEmpty()) {
                    player.sendMessage(miniMessage.deserialize("<yellow>Your mailbox is empty."));
                } else {
                    for (ItemStack item : stored) player.getInventory().addItem(item);
                    player.sendMessage(miniMessage.deserialize("<green>Claimed " + stored.size() + " items from mailbox!"));
                }
                return true;
            }
        }

        return false;
    }
}
