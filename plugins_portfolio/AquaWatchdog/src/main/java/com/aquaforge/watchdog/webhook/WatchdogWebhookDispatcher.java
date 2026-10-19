package com.aquaforge.watchdog.webhook;

import com.aquaforge.watchdog.AquaWatchdog;
import org.bukkit.Bukkit;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * High-speed Async Webhook Dispatcher for AquaWatchdog.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class WatchdogWebhookDispatcher {

    private final AquaWatchdog plugin;

    public WatchdogWebhookDispatcher(AquaWatchdog plugin) {
        this.plugin = plugin;
    }

    public void dispatchAlert(String playerName, String violationType, String details, int ping) {
        if (!plugin.getConfig().getBoolean("webhook.enabled", true)) return;

        String webhookUrl = plugin.getConfig().getString("webhook.url");
        if (webhookUrl == null || webhookUrl.trim().isEmpty()) return;

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URL url = URI.create(webhookUrl).toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(3000);

                String jsonPayload = String.format(
                        "{\"type\":\"anti-cheat-flag\",\"player\":\"%s\",\"check\":\"%s\",\"details\":\"%s\",\"ping\":%d,\"timestamp\":%d}",
                        playerName, violationType, details, ping, System.currentTimeMillis()
                );

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                if (code >= 400) {
                    plugin.getLogger().warning("Webhook alert failed with response code: " + code);
                }
            } catch (Exception e) {
                plugin.getLogger().warning("Failed to dispatch Watchdog webhook: " + e.getMessage());
            }
        });
    }
}
