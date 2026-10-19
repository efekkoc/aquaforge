package com.aquaforge.watchdog.command;

import com.aquaforge.watchdog.AquaWatchdog;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

/**
 * Command Handler for /watchdog.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class WatchdogCommand implements CommandExecutor {

    private final AquaWatchdog plugin;

    public WatchdogCommand(AquaWatchdog plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!sender.hasPermission("aquawatchdog.staff")) {
            sender.sendMessage(ChatColor.RED + "You do not have permission to use Watchdog commands.");
            return true;
        }

        if (args.length == 0) {
            sendHelp(sender);
            return true;
        }

        String sub = args[0].toLowerCase();

        switch (sub) {
            case "testwebhook" -> {
                sender.sendMessage(ChatColor.YELLOW + "[AquaWatchdog] Dispatching mock test alert to configured webhook...");
                plugin.getWebhookDispatcher().dispatchAlert("TestBot_99", "Reach_Simulation", "3.84 blocks (Synthetic Flag)", 28);
                sender.sendMessage(ChatColor.GREEN + "[AquaWatchdog] Webhook test payload sent!");
            }
            case "check" -> {
                if (args.length < 2) {
                    sender.sendMessage(ChatColor.RED + "Usage: /watchdog check <player>");
                    return true;
                }
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(ChatColor.RED + "Player not found!");
                    return true;
                }
                sender.sendMessage(ChatColor.DARK_AQUA + "=========== " + ChatColor.AQUA + "Watchdog Telemetry: " + target.getName() + ChatColor.DARK_AQUA + " ===========");
                sender.sendMessage(ChatColor.GRAY + "Ping: " + ChatColor.WHITE + target.getPing() + "ms");
                sender.sendMessage(ChatColor.GRAY + "GameMode: " + ChatColor.WHITE + target.getGameMode());
                sender.sendMessage(ChatColor.GRAY + "Location: " + ChatColor.WHITE +
                        String.format("%.1f, %.1f, %.1f", target.getLocation().getX(), target.getLocation().getY(), target.getLocation().getZ()));
                sender.sendMessage(ChatColor.DARK_AQUA + "=========================================================");
            }
            case "reload" -> {
                plugin.reloadConfig();
                sender.sendMessage(ChatColor.GREEN + "[AquaWatchdog] Configuration reloaded successfully!");
            }
            default -> sendHelp(sender);
        }

        return true;
    }

    private void sendHelp(CommandSender sender) {
        sender.sendMessage(ChatColor.DARK_AQUA + "AquaWatchdog Commands:");
        sender.sendMessage(ChatColor.GRAY + "  /watchdog check <player> §8- Inspect player latency and state");
        sender.sendMessage(ChatColor.GRAY + "  /watchdog testwebhook §8- Dispatch test alert payload");
        sender.sendMessage(ChatColor.GRAY + "  /watchdog reload §8- Reload watchdog parameters");
    }
}
