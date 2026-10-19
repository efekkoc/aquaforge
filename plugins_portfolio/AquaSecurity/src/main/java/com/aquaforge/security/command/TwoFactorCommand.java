package com.aquaforge.security.command;

import com.aquaforge.security.AquaSecurity;
import com.aquaforge.security.auth.TotpAuthEngine;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.OfflinePlayer;
import org.bukkit.Sound;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.potion.PotionEffectType;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Command handler for /2fa.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class TwoFactorCommand implements CommandExecutor {

    private final AquaSecurity plugin;
    // Temporary pending secrets waiting for initial verification
    private final Map<UUID, String> pendingSecrets = new HashMap<>();

    public TwoFactorCommand(AquaSecurity plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage(ChatColor.RED + "This command can only be executed by players.");
            return true;
        }

        String prefix = ChatColor.translateAlternateColorCodes('&',
                plugin.getConfig().getString("messages.prefix", "&3&lAquaSecurity &8» "));

        if (args.length == 0) {
            sendHelp(player, prefix);
            return true;
        }

        String sub = args[0].toLowerCase();

        switch (sub) {
            case "setup" -> handleSetup(player, prefix);
            case "verify" -> {
                if (args.length < 2) {
                    player.sendMessage(prefix + ChatColor.RED + "Usage: /2fa verify <6-digit-code>");
                    return true;
                }
                handleVerify(player, args[1], prefix);
            }
            case "status" -> handleStatus(player, prefix);
            case "reset" -> {
                if (!player.hasPermission("aquasecurity.admin")) {
                    player.sendMessage(prefix + ChatColor.RED + "You do not have permission to reset 2FA.");
                    return true;
                }
                if (args.length < 2) {
                    player.sendMessage(prefix + ChatColor.RED + "Usage: /2fa reset <player-name>");
                    return true;
                }
                handleAdminReset(player, args[1], prefix);
            }
            default -> sendHelp(player, prefix);
        }

        return true;
    }

    private void handleSetup(Player player, String prefix) {
        if (plugin.has2faEnabled(player.getUniqueId())) {
            player.sendMessage(prefix + ChatColor.YELLOW + "2FA is already configured on your account. To reset, contact a server administrator.");
            return;
        }

        String secret = TotpAuthEngine.generateSecretKey();
        pendingSecrets.put(player.getUniqueId(), secret);

        player.sendMessage(ChatColor.DARK_AQUA + "================= " + ChatColor.AQUA + "AquaSecurity 2FA Setup" + ChatColor.DARK_AQUA + " =================");
        player.sendMessage(ChatColor.WHITE + "Step 1: Open " + ChatColor.GOLD + "Google Authenticator" + ChatColor.WHITE + " or " + ChatColor.GOLD + "Authy" + ChatColor.WHITE + ".");
        player.sendMessage(ChatColor.WHITE + "Step 2: Choose 'Enter a setup key' and paste this key:");
        player.sendMessage(ChatColor.YELLOW + "  Secret Key: " + ChatColor.BOLD + ChatColor.GREEN + secret);
        player.sendMessage(ChatColor.WHITE + "Step 3: Finish by typing: " + ChatColor.AQUA + "/2fa verify <code>");
        player.sendMessage(ChatColor.DARK_AQUA + "==========================================================");
    }

    private void handleVerify(Player player, String codeStr, String prefix) {
        int code;
        try {
            code = Integer.parseInt(codeStr.trim());
        } catch (NumberFormatException e) {
            player.sendMessage(prefix + ChatColor.RED + "Code must be a 6-digit number!");
            return;
        }

        UUID uuid = player.getUniqueId();
        String activeSecret = plugin.getSecret(uuid);
        boolean isInitialSetup = false;

        if (activeSecret == null) {
            activeSecret = pendingSecrets.get(uuid);
            isInitialSetup = true;
        }

        if (activeSecret == null) {
            player.sendMessage(prefix + ChatColor.RED + "No 2FA setup found. Type /2fa setup first.");
            return;
        }

        boolean valid = TotpAuthEngine.verifyCode(activeSecret, code);

        if (valid) {
            if (isInitialSetup) {
                plugin.setSecret(uuid, activeSecret);
                pendingSecrets.remove(uuid);
                player.sendMessage(prefix + ChatColor.GREEN + "2FA successfully linked and activated!");
            }

            String ip = player.getAddress() != null ? player.getAddress().getAddress().getHostAddress() : "";
            plugin.unfreezePlayer(uuid, ip);
            player.removePotionEffect(PotionEffectType.BLINDNESS);
            player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.2f);
            player.sendMessage(prefix + ChatColor.GREEN + "Authentication successful! Enjoy your game.");
        } else {
            player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_BASS, 1.0f, 0.5f);
            player.sendMessage(prefix + ChatColor.RED + "Invalid code. Please ensure your clock is synced.");
        }
    }

    private void handleStatus(Player player, String prefix) {
        boolean enabled = plugin.has2faEnabled(player.getUniqueId());
        player.sendMessage(prefix + ChatColor.GRAY + "Your 2FA Status: " +
                (enabled ? ChatColor.GREEN + "ACTIVE & SECURED" : ChatColor.RED + "NOT CONFIGURED"));
    }

    private void handleAdminReset(Player admin, String targetName, String prefix) {
        OfflinePlayer target = Bukkit.getOfflinePlayer(targetName);
        if (target.getUniqueId() == null) {
            admin.sendMessage(prefix + ChatColor.RED + "Player not found.");
            return;
        }

        plugin.reset2fa(target.getUniqueId());
        pendingSecrets.remove(target.getUniqueId());
        admin.sendMessage(prefix + ChatColor.GREEN + "Successfully reset 2FA secret for: " + targetName);
    }

    private void sendHelp(Player player, String prefix) {
        player.sendMessage(prefix + ChatColor.DARK_AQUA + "Commands:");
        player.sendMessage(ChatColor.GRAY + "  /2fa setup " + ChatColor.DARK_GRAY + "- Generate new Authenticator key");
        player.sendMessage(ChatColor.GRAY + "  /2fa verify <code> " + ChatColor.DARK_GRAY + "- Verify 6-digit TOTP code");
        player.sendMessage(ChatColor.GRAY + "  /2fa status " + ChatColor.DARK_GRAY + "- Check 2FA security status");
        if (player.hasPermission("aquasecurity.admin")) {
            player.sendMessage(ChatColor.GRAY + "  /2fa reset <player> " + ChatColor.DARK_GRAY + "- Reset user 2FA secret");
        }
    }
}
