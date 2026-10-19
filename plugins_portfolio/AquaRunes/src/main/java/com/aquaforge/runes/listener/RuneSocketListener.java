package com.aquaforge.runes.listener;

import com.aquaforge.runes.AquaRunes;
import com.aquaforge.runes.model.RuneType;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.persistence.PersistentDataType;

/**
 * Handles Drag & Drop socketing in inventory.
 * Authored by Turgut Efekan Koç (efekkoc)
 */
public class RuneSocketListener implements Listener {

    private final AquaRunes plugin;

    public RuneSocketListener(AquaRunes plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (!(event.getWhoClicked() instanceof Player player)) return;

        ItemStack cursor = event.getCursor();
        ItemStack current = event.getCurrentItem();

        if (cursor.getType().isAir() || current == null || current.getType().isAir()) return;

        // Check if cursor is a Rune stone
        if (!cursor.hasItemMeta()) return;
        String runeId = cursor.getItemMeta().getPersistentDataContainer()
                .get(plugin.getItemFactory().getRuneKey(), PersistentDataType.STRING);

        if (runeId == null) return;
        RuneType rune = RuneType.fromId(runeId);
        if (rune == null) return;

        // Check if target is a weapon or armor
        Material mat = current.getType();
        boolean isGear = mat.name().endsWith("_SWORD") ||
                mat.name().endsWith("_AXE") ||
                mat.name().endsWith("_MACE") ||
                mat.name().endsWith("_HELMET") ||
                mat.name().endsWith("_CHESTPLATE") ||
                mat.name().endsWith("_LEGGINGS") ||
                mat.name().endsWith("_BOOTS") ||
                mat == Material.BOW ||
                mat == Material.CROSSBOW;

        if (!isGear) return;

        event.setCancelled(true);

        boolean success = plugin.getItemFactory().applyRuneToGear(current, rune);
        if (success) {
            cursor.setAmount(cursor.getAmount() - 1);
            event.getView().setCursor(cursor.getAmount() <= 0 ? null : cursor);

            player.playSound(player.getLocation(), Sound.BLOCK_ENCHANTMENT_TABLE_USE, 1.0f, 1.2f);
            player.playSound(player.getLocation(), Sound.BLOCK_AMETHYST_BLOCK_CHIME, 1.0f, 1.0f);
            player.sendMessage(ChatColor.DARK_AQUA + "[AquaRunes] " + rune.getColor() +
                    "✦ Successfully socketed " + rune.getDisplayName() + " into your gear!");
        } else {
            player.playSound(player.getLocation(), Sound.BLOCK_ANVIL_PLACE, 1.0f, 0.8f);
            player.sendMessage(ChatColor.RED + "[AquaRunes] This item already contains a socketed rune!");
        }
    }
}
