package com.aquaforge.scoreboard;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scoreboard.*;

import java.util.*;

/**
 * AquaScoreboard - Modern Flicker-Free RGB Scoreboard & Tablist Engine.
 * Supports Paper 1.20.x through 1.21.11 with native Kyori Adventure.
 *
 * @author Turgut Efekan Koç (efekkoc)
 * @version 1.0.0
 */
public final class AquaScoreboard extends JavaPlugin implements Listener, CommandExecutor {

    private static AquaScoreboard instance;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();
    private final Set<UUID> disabledPlayers = new HashSet<>();

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("sb") != null) getCommand("sb").setExecutor(this);
        if (getCommand("sbreload") != null) getCommand("sbreload").setExecutor(this);

        // Scoreboard & Tablist refresh task (every second)
        Bukkit.getScheduler().runTaskTimer(this, this::updateAllScoreboards, 20L, 20L);

        getLogger().info("=================================================");
        getLogger().info(" AquaScoreboard v" + getDescription().getVersion() + " Initialized");
        getLogger().info(" Engine: Paper 1.20.x – 1.21.11 Universal Scoreboard");
        getLogger().info(" Author: Turgut Efekan Koç (efekkoc)");
        getLogger().info("=================================================");
    }

    @Override
    public void onDisable() {
        disabledPlayers.clear();
        getLogger().info("AquaScoreboard disabled gracefully.");
    }

    public static AquaScoreboard getInstance() {
        return instance;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        updatePlayerScoreboard(event.getPlayer());
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        disabledPlayers.remove(event.getPlayer().getUniqueId());
    }

    public void updateAllScoreboards() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            updatePlayerScoreboard(player);
        }
    }

    public void updatePlayerScoreboard(Player player) {
        if (disabledPlayers.contains(player.getUniqueId())) return;

        // Tablist Header / Footer
        Component header = miniMessage.deserialize(getConfig().getString("tablist.header", "<gradient:#00d2ff:#3a7bd5>★ AQUAFORGE ★</gradient>\n"));
        Component footer = miniMessage.deserialize(getConfig().getString("tablist.footer", "\n<gray>play.aquaforge.gg"));
        player.sendPlayerListHeaderAndFooter(header, footer);

        // Sidebar
        ScoreboardManager manager = Bukkit.getScoreboardManager();
        Scoreboard board = player.getScoreboard();
        if (board.equals(manager.getMainScoreboard())) {
            board = manager.getNewScoreboard();
            player.setScoreboard(board);
        }

        Objective obj = board.getObjective("aquasb");
        if (obj == null) {
            obj = board.registerNewObjective("aquasb", Criteria.DUMMY, miniMessage.deserialize(getConfig().getString("scoreboard.title", "AquaForge")));
            obj.setDisplaySlot(DisplaySlot.SIDEBAR);
        }

        List<String> lines = getConfig().getStringList("scoreboard.lines");
        int score = lines.size();

        for (String raw : lines) {
            String parsed = raw
                    .replace("%player%", player.getName())
                    .replace("%rank%", player.isOp() ? "Admin" : "Member")
                    .replace("%balance%", "1,250.00")
                    .replace("%ping%", String.valueOf(player.getPing()))
                    .replace("%online%", String.valueOf(Bukkit.getOnlinePlayers().size()))
                    .replace("%max%", String.valueOf(Bukkit.getMaxPlayers()))
                    .replace("%tps%", String.format("%.1f", Math.min(20.0, Bukkit.getTPS()[0])));

            Component lineComp = miniMessage.deserialize(parsed);
            String entryKey = "§" + (score < 10 ? "0" + score : score);

            Team team = board.getTeam("line_" + score);
            if (team == null) {
                team = board.registerNewTeam("line_" + score);
                team.addEntry(entryKey);
            }
            team.prefix(lineComp);
            obj.getScore(entryKey).setScore(score);
            score--;
        }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("sb")) {
            if (!(sender instanceof Player player)) {
                sender.sendMessage("Console has no scoreboard.");
                return true;
            }

            if (disabledPlayers.contains(player.getUniqueId())) {
                disabledPlayers.remove(player.getUniqueId());
                player.sendMessage(miniMessage.deserialize("<green>Scoreboard shown!"));
                updatePlayerScoreboard(player);
            } else {
                disabledPlayers.add(player.getUniqueId());
                player.setScoreboard(Bukkit.getScoreboardManager().getNewScoreboard());
                player.sendMessage(miniMessage.deserialize("<yellow>Scoreboard hidden!"));
            }
            return true;
        }

        if (command.getName().equalsIgnoreCase("sbreload")) {
            reloadConfig();
            updateAllScoreboards();
            sender.sendMessage(miniMessage.deserialize("<green>AquaScoreboard configuration reloaded successfully!"));
            return true;
        }

        return false;
    }
}
