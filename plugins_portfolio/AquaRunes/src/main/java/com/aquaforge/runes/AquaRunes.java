package com.aquaforge.runes;

import com.aquaforge.runes.command.RuneCommand;
import com.aquaforge.runes.engine.RuneItemFactory;
import com.aquaforge.runes.listener.RuneCombatListener;
import com.aquaforge.runes.listener.RuneSocketListener;
import com.aquaforge.runes.model.RuneType;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;

/**
 * AquaRunes - Modern 1.21.4 Data Components Weapon and Armor Enchant Rune Engine.
 *
 * Authored by Turgut Efekan Koç (efekkoc)
 * Portfolio: https://github.com/efekkoc
 */
public class AquaRunes extends JavaPlugin {

    private static AquaRunes instance;
    private RuneItemFactory itemFactory;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        itemFactory = new RuneItemFactory(this);

        // Register Command & Listeners
        if (getCommand("aquarunes") != null) {
            getCommand("aquarunes").setExecutor(new RuneCommand(this));
        }

        getServer().getPluginManager().registerEvents(new RuneSocketListener(this), this);
        getServer().getPluginManager().registerEvents(new RuneCombatListener(this), this);

        // Start Ambient Particle Aura Task (Subtle rotating ring around players carrying active runes)
        startAuraTask();

        getLogger().info("=========================================");
        getLogger().info(" AquaRunes v" + getDescription().getVersion() + " initialized!");
        getLogger().info(" Authored by Turgut Efekan Koç (efekkoc)");
        getLogger().info(" Modern Paper 1.21.4 Data Components");
        getLogger().info("=========================================");
    }

    @Override
    public void onDisable() {
        getLogger().info("AquaRunes disabled cleanly.");
    }

    public static AquaRunes getInstance() {
        return instance;
    }

    public RuneItemFactory getItemFactory() {
        return itemFactory;
    }

    private void startAuraTask() {
        new BukkitRunnable() {
            double angle = 0;

            @Override
            public void run() {
                if (!getConfig().getBoolean("particles.ambient-ring-enabled", true)) return;

                angle += 0.2;
                if (angle >= Math.PI * 2) angle = 0;

                for (Player player : Bukkit.getOnlinePlayers()) {
                    ItemStack mainHand = player.getInventory().getItemInMainHand();
                    RuneType rune = itemFactory.getSocketedRune(mainHand);

                    if (rune != null) {
                        Location loc = player.getLocation().add(0, 0.2, 0);
                        double x = Math.cos(angle) * 0.9;
                        double z = Math.sin(angle) * 0.9;
                        loc.add(x, 0, z);

                        player.getWorld().spawnParticle(rune.getParticle(), loc, 1, 0, 0, 0, 0.01);
                    }
                }
            }
        }.runTaskTimer(this, 20L, 3L);
    }
}
