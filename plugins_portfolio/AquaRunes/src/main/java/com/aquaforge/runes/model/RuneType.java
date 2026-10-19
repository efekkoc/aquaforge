package com.aquaforge.runes.model;

import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.Particle;

/**
 * Registry of Legendary Runes supported by AquaRunes.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public enum RuneType {
    LIFESTEAL(
            "lifesteal",
            "Rune of the Vampire",
            ChatColor.RED,
            Material.NETHER_STAR,
            Particle.HEART,
            "Siphons 25% of inflicted melee damage into player vitality."
    ),
    THUNDERSTRIKE(
            "thunderstrike",
            "Rune of the Tempest",
            ChatColor.YELLOW,
            Material.AMETHYST_SHARD,
            Particle.ELECTRIC_SPARK,
            "Calls down harmless celestial thunderbolts dealing bonus shock damage."
    ),
    WIND_BURST(
            "wind_burst",
            "Rune of the Gale",
            ChatColor.AQUA,
            Material.BREEZE_ROD,
            Particle.GUST,
            "Propels the user forward with gust acceleration on sprint attacks."
    ),
    FROZEN_BLADE(
            "frozen_blade",
            "Rune of Cryo Stasis",
            ChatColor.BLUE,
            Material.PRISMARINE_SHARD,
            Particle.SNOWFLAKE,
            "Freezes the victim with Slowness III & Frostbite effect for 3.5s."
    ),
    PHOENIX(
            "phoenix",
            "Rune of the Phoenix",
            ChatColor.GOLD,
            Material.FIRE_CHARGE,
            Particle.FLAME,
            "Averts lethal damage, fully restoring hearts and igniting foes (5m CD)."
    ),
    TITAN(
            "titan",
            "Rune of the Colossus",
            ChatColor.GRAY,
            Material.HEAVY_CORE,
            Particle.CRIT,
            "Hardens armor, deflecting 20% of incoming physical damage to attackers."
    );

    private final String id;
    private final String displayName;
    private final ChatColor color;
    private final Material socketMaterial;
    private final Particle particle;
    private final String description;

    RuneType(String id, String displayName, ChatColor color, Material socketMaterial, Particle particle, String description) {
        this.id = id;
        this.displayName = displayName;
        this.color = color;
        this.socketMaterial = socketMaterial;
        this.particle = particle;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public ChatColor getColor() {
        return color;
    }

    public Material getSocketMaterial() {
        return socketMaterial;
    }

    public Particle getParticle() {
        return particle;
    }

    public String getDescription() {
        return description;
    }

    public static RuneType fromId(String id) {
        for (RuneType type : values()) {
            if (type.id.equalsIgnoreCase(id)) return type;
        }
        return null;
    }
}
