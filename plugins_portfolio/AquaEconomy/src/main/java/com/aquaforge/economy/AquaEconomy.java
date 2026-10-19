package com.aquaforge.economy;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.OfflinePlayer;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * AquaEconomy - Enterprise Banking & Economy Engine.
 * Universal support for Paper 1.20.x – 1.21.4 (Optimized for 1.21.1 & 1.21.4).
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaEconomy extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaEconomy instance;
    private final Map<UUID, Double> wallets = new HashMap<>();
    private final Map<UUID, Double> banks = new HashMap<>();
    private File dataFile;
    private FileConfiguration dataConfig;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();
        loadData();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("economy") != null) getCommand("economy").setExecutor(this);
        if (getCommand("balance") != null) getCommand("balance").setExecutor(this);
        if (getCommand("pay") != null) getCommand("pay").setExecutor(this);
        if (getCommand("bank") != null) getCommand("bank").setExecutor(this);

        getLogger().info("=========================================");
        getLogger().info(" AquaEconomy v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Universal Paper 1.20.x - 1.21.4 Support");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        saveData();
        getLogger().info("AquaEconomy data saved cleanly.");
    }

    public static AquaEconomy getInstance() {
        return instance;
    }

    public double getWallet(UUID uuid) {
        return wallets.getOrDefault(uuid, getConfig().getDouble("currency.initial-balance", 500.0));
    }

    public void setWallet(UUID uuid, double amount) {
        wallets.put(uuid, Math.max(0, amount));
    }

    public double getBank(UUID uuid) {
        return banks.getOrDefault(uuid, 0.0);
    }

    public void setBank(UUID uuid, double amount) {
        banks.put(uuid, Math.max(0, amount));
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        UUID uuid = event.getPlayer().getUniqueId();
        if (!wallets.containsKey(uuid)) {
            wallets.put(uuid, getConfig().getDouble("currency.initial-balance", 500.0));
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        String name = command.getName().toLowerCase();
        String prefix = ChatColor.translateAlternateColorCodes('&',
                getConfig().getString("messages.prefix", "&2&lAquaEconomy &8» "));

        if (name.equals("balance")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Players only.");
                return true;
            }
            double w = getWallet(player.getUniqueId());
            double b = getBank(player.getUniqueId());
            player.sendMessage(prefix + ChatColor.GRAY + "Wallet: " + ChatColor.GREEN + "$" + String.format("%.2f", w) +
                    ChatColor.DARK_GRAY + " | " + ChatColor.GRAY + "Bank: " + ChatColor.GOLD + "$" + String.format("%.2f", b));
            return true;
        }

        if (name.equals("pay")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Players only.");
                return true;
            }
            if (args.length < 2) {
                player.sendMessage(prefix + ChatColor.RED + "Usage: /pay <player> <amount>");
                return true;
            }
            Player target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                player.sendMessage(prefix + ChatColor.RED + "Player not found or offline.");
                return true;
            }
            double amount;
            try {
                amount = Double.parseDouble(args[1]);
                if (amount <= 0) throw new NumberFormatException();
            } catch (NumberFormatException e) {
                player.sendMessage(prefix + ChatColor.RED + "Amount must be a positive number.");
                return true;
            }

            double senderBal = getWallet(player.getUniqueId());
            if (senderBal < amount) {
                player.sendMessage(prefix + ChatColor.RED + "Insufficient funds in your wallet!");
                return true;
            }

            setWallet(player.getUniqueId(), senderBal - amount);
            setWallet(target.getUniqueId(), getWallet(target.getUniqueId()) + amount);

            player.sendMessage(prefix + ChatColor.RED + "-$" + String.format("%.2f", amount) + ChatColor.GRAY + " sent to " + target.getName() + ".");
            target.sendMessage(prefix + ChatColor.GREEN + "+$" + String.format("%.2f", amount) + ChatColor.GRAY + " received from " + player.getName() + "!");
            target.playSound(target.getLocation(), Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 0.8f, 1.2f);
            return true;
        }

        if (name.equals("economy")) {
            if (!sender.hasPermission("aquaeconomy.admin")) {
                sender.sendMessage(ChatColor.RED + "No permission.");
                return true;
            }
            if (args.length < 3) {
                sender.sendMessage(prefix + ChatColor.RED + "Usage: /eco <give|take|set> <player> <amount>");
                return true;
            }
            OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
            double amt;
            try {
                amt = Double.parseDouble(args[2]);
            } catch (NumberFormatException e) {
                sender.sendMessage(ChatColor.RED + "Invalid amount.");
                return true;
            }

            String action = args[0].toLowerCase();
            double cur = getWallet(target.getUniqueId());

            if (action.equals("give")) {
                setWallet(target.getUniqueId(), cur + amt);
                sender.sendMessage(prefix + ChatColor.GREEN + "Gave $" + amt + " to " + target.getName());
            } else if (action.equals("take")) {
                setWallet(target.getUniqueId(), Math.max(0, cur - amt));
                sender.sendMessage(prefix + ChatColor.YELLOW + "Deducted $" + amt + " from " + target.getName());
            } else if (action.equals("set")) {
                setWallet(target.getUniqueId(), amt);
                sender.sendMessage(prefix + ChatColor.AQUA + "Set balance of " + target.getName() + " to $" + amt);
            }
            return true;
        }

        return false;
    }

    private void loadData() {
        dataFile = new File(getDataFolder(), "balances.yml");
        if (!dataFile.exists()) {
            getDataFolder().mkdirs();
            try { dataFile.createNewFile(); } catch (IOException ignored) {}
        }
        dataConfig = YamlConfiguration.loadConfiguration(dataFile);
        if (dataConfig.contains("wallets")) {
            for (String key : dataConfig.getConfigurationSection("wallets").getKeys(false)) {
                wallets.put(UUID.fromString(key), dataConfig.getDouble("wallets." + key));
            }
        }
        if (dataConfig.contains("banks")) {
            for (String key : dataConfig.getConfigurationSection("banks").getKeys(false)) {
                banks.put(UUID.fromString(key), dataConfig.getDouble("banks." + key));
            }
        }
    }

    private void saveData() {
        if (dataConfig == null || dataFile == null) return;
        for (Map.Entry<UUID, Double> e : wallets.entrySet()) {
            dataConfig.set("wallets." + e.getKey().toString(), e.getValue());
        }
        for (Map.Entry<UUID, Double> e : banks.entrySet()) {
            dataConfig.set("banks." + e.getKey().toString(), e.getValue());
        }
        try { dataConfig.save(dataFile); } catch (IOException ignored) {}
    }
}
