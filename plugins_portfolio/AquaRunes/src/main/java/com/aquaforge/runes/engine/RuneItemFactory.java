package com.aquaforge.runes.engine;

import com.aquaforge.runes.AquaRunes;
import com.aquaforge.runes.model.RuneType;
import org.bukkit.ChatColor;
import org.bukkit.NamespacedKey;
import org.bukkit.inventory.ItemFlag;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;

import java.util.ArrayList;
import java.util.List;

/**
 * Modern Data Components & PDC Item Factory for AquaRunes.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class RuneItemFactory {

    private final AquaRunes plugin;
    private final NamespacedKey runeKey;

    public RuneItemFactory(AquaRunes plugin) {
        this.plugin = plugin;
        this.runeKey = new NamespacedKey(plugin, "aqua_rune_type");
    }

    public NamespacedKey getRuneKey() {
        return runeKey;
    }

    /**
     * Creates a standalone physical Rune item that can be applied to gear.
     */
    public ItemStack createRuneStone(RuneType type) {
        ItemStack item = new ItemStack(type.getSocketMaterial());
        ItemMeta meta = item.getItemMeta();
        if (meta == null) return item;

        meta.setDisplayName(type.getColor() + "" + ChatColor.BOLD + "✦ " + type.getDisplayName() + " ✦");

        List<String> lore = new ArrayList<>();
        lore.add(ChatColor.DARK_GRAY + "Mythic Rune Stone");
        lore.add("");
        lore.add(ChatColor.GRAY + "Ability: " + type.getColor() + type.getDescription());
        lore.add("");
        lore.add(ChatColor.YELLOW + "Drag & Drop onto a Weapon or Armor piece");
        lore.add(ChatColor.YELLOW + "in your inventory to socket this rune.");
        lore.add("");
        lore.add(ChatColor.DARK_AQUA + "AquaForge Runic Matrix • Paper 1.21.4");

        meta.setLore(lore);
        meta.addItemFlags(ItemFlag.HIDE_ATTRIBUTES);

        // Store rune ID into PDC
        meta.getPersistentDataContainer().set(runeKey, PersistentDataType.STRING, type.getId());
        item.setItemMeta(meta);

        return item;
    }

    /**
     * Sockets a rune into an existing weapon/armor piece.
     */
    public boolean applyRuneToGear(ItemStack gear, RuneType type) {
        if (gear == null || gear.getItemMeta() == null) return false;

        ItemMeta meta = gear.getItemMeta();
        PersistentDataContainer pdc = meta.getPersistentDataContainer();

        // Check if already socketed
        if (pdc.has(runeKey, PersistentDataType.STRING)) {
            return false;
        }

        pdc.set(runeKey, PersistentDataType.STRING, type.getId());

        List<String> lore = meta.getLore();
        if (lore == null) lore = new ArrayList<>();

        lore.add("");
        lore.add(type.getColor() + "✦ Socketed: " + ChatColor.BOLD + type.getDisplayName());
        lore.add(ChatColor.DARK_GRAY + "  " + type.getDescription());

        meta.setLore(lore);
        gear.setItemMeta(meta);
        return true;
    }

    /**
     * Checks if gear has a specific rune socketed.
     */
    public RuneType getSocketedRune(ItemStack gear) {
        if (gear == null || !gear.hasItemMeta()) return null;
        PersistentDataContainer pdc = gear.getItemMeta().getPersistentDataContainer();
        String runeId = pdc.get(runeKey, PersistentDataType.STRING);
        return runeId != null ? RuneType.fromId(runeId) : null;
    }
}
