package com.aquaforge.security;

import com.aquaforge.security.command.TwoFactorCommand;
import com.aquaforge.security.listener.SecurityFreezeListener;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * AquaSecurity - Enterprise 2FA & Admin Session Guard
 * Designed for modern Paper 1.21.4 Minecraft networks.
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaSecurity extends JavaPlugin {

    private static AquaSecurity instance;
    private File usersFile;
    private FileConfiguration usersConfig;

    // Cache of players currently in lock state (UUID -> join timestamp)
    private final Set<UUID> frozenPlayers = new HashSet<>();
    // Session cache (UUID -> last validated IP address)
    private final Map<UUID, String> activeSessions = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();
        loadUsersStorage();

        // Register Command and Event Listeners
        if (getCommand("2fa") != null) {
            getCommand("2fa").setExecutor(new TwoFactorCommand(this));
        }
        getServer().getPluginManager().registerEvents(new SecurityFreezeListener(this), this);

        getLogger().info("=========================================");
        getLogger().info(" AquaSecurity v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Modern Paper 1.21.4 Enterprise Guard");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        frozenPlayers.clear();
        activeSessions.clear();
        saveUsersStorage();
        getLogger().info("AquaSecurity disabled cleanly.");
    }

    public static AquaSecurity getInstance() {
        return instance;
    }

    private void loadUsersStorage() {
        usersFile = new File(getDataFolder(), "users.yml");
        if (!usersFile.exists()) {
            try {
                getDataFolder().mkdirs();
                usersFile.createNewFile();
            } catch (IOException e) {
                getLogger().severe("Could not create users.yml: " + e.getMessage());
            }
        }
        usersConfig = YamlConfiguration.loadConfiguration(usersFile);
    }

    public void saveUsersStorage() {
        if (usersConfig != null && usersFile != null) {
            try {
                usersConfig.save(usersFile);
            } catch (IOException e) {
                getLogger().severe("Could not save users.yml: " + e.getMessage());
            }
        }
    }

    public boolean has2faEnabled(UUID uuid) {
        return usersConfig.contains("users." + uuid + ".secret");
    }

    public String getSecret(UUID uuid) {
        return usersConfig.getString("users." + uuid + ".secret");
    }

    public void setSecret(UUID uuid, String secret) {
        usersConfig.set("users." + uuid + ".secret", secret);
        usersConfig.set("users." + uuid + ".created", System.currentTimeMillis());
        saveUsersStorage();
    }

    public void reset2fa(UUID uuid) {
        usersConfig.set("users." + uuid, null);
        saveUsersStorage();
        activeSessions.remove(uuid);
    }

    public boolean isFrozen(UUID uuid) {
        return frozenPlayers.contains(uuid);
    }

    public void freezePlayer(UUID uuid) {
        frozenPlayers.add(uuid);
    }

    public void unfreezePlayer(UUID uuid, String ip) {
        frozenPlayers.remove(uuid);
        if (getConfig().getBoolean("session-caching.enabled", true) && ip != null) {
            activeSessions.put(uuid, ip);
        }
    }

    public boolean hasActiveSession(UUID uuid, String currentIp) {
        if (!getConfig().getBoolean("session-caching.enabled", true)) {
            return false;
        }
        String cachedIp = activeSessions.get(uuid);
        return cachedIp != null && cachedIp.equals(currentIp);
    }
}
