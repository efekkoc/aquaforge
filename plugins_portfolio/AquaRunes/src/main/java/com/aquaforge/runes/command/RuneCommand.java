package com.aquaforge.runes.command;

import com.aquaforge.runes.AquaRunes;
import com.aquaforge.runes.model.RuneType;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;

/**
 * Command Handler for AquaRunes.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class RuneCommand implements CommandExecutor {

    private final AquaRunes plugin;

    public RuneCommand(AquaRunes plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!sender.hasPermission("aquarunes.admin")) {
            sender.sendMessage(ChatColor.RED + "You do not have permission to manage runes.");
            return true;
        }

        if (args.length == 0) {
            sendHelp(sender);
            return true;
        }

        String sub = args[0].toLowerCase();

        switch (sub) {
            case "give" -> {
                if (args.length < 3) {
                    sender.sendMessage(ChatColor.RED + "Usage: /aquarunes give <player> <rune_id>");
                    return true;
                }
                Player target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(ChatColor.RED + "Player not found!");
                    return true;
                }

                RuneType type = RuneType.fromId(args[2]);
                if (type == null) {
                    sender.sendMessage(ChatColor.RED + "Unknown rune! Type /aquarunes list to see all runes.");
                    return true;
                }

                ItemStack stone = plugin.getItemFactory().createRuneStone(type);
                target.getInventory().addItem(stone);
                sender.sendMessage(ChatColor.GREEN + "Granted " + type.getColor() + type.getDisplayName() + ChatColor.GREEN + " to " + target.getName() + ".");
                target.sendMessage(ChatColor.DARK_AQUA + "[AquaRunes] " + ChatColor.GREEN + "You received a " + type.getColor() + type.getDisplayName() + "!");
            }
            case "list" -> {
                sender.sendMessage(ChatColor.DARK_AQUA + "============= " + ChatColor.AQUA + "AquaRunes Rune Matrix" + ChatColor.DARK_AQUA + " =============");
                for (RuneType type : RuneType.values()) {
                    sender.sendMessage(type.getColor() + "✦ " + type.getId() + " §7- " + type.getDisplayName() + " §8(" + type.getDescription() + ")");
                }
                sender.sendMessage(ChatColor.DARK_AQUA + "==================================================");
            }
            case "reload" -> {
                plugin.reloadConfig();
                sender.sendMessage(ChatColor.GREEN + "[AquaRunes] Configuration reloaded successfully!");
            }
            default -> sendHelp(sender);
        }

        return true;
    }

    private void sendHelp(CommandSender sender) {
        sender.sendMessage(ChatColor.DARK_AQUA + "AquaRunes Commands:");
        sender.sendMessage(ChatColor.GRAY + "  /aquarunes give <player> <rune_id> §8- Grant a rune stone");
        sender.sendMessage(ChatColor.GRAY + "  /aquarunes list §8- View all registered runes");
        sender.sendMessage(ChatColor.GRAY + "  /aquarunes reload §8- Reload configuration");
    }
}
