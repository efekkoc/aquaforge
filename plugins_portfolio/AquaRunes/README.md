<div align="center">

# 🔮 AquaRunes
### Modern 1.20.x – 1.21.4 Data Components Weapon & Armor Rune Engine

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![PaperMC](https://img.shields.io/badge/PaperMC-1.20.x--1.21.4-blue?logo=minecraft)
![Optimized](https://img.shields.io/badge/Optimized-1.21.1%20%7C%201.21.4-teal)
![Data Components](https://img.shields.io/badge/Minecraft-Universal%20PDC-cyan)
![License](https://img.shields.io/badge/License-MIT-emerald)
[![GitHub](https://img.shields.io/badge/Author-efekkoc-cyan?logo=github)](https://github.com/efekkoc)

**AquaRunes** brings an RPG-tier socketing system to Minecraft 1.21.4 servers using modern `PersistentDataContainer` (PDC) and custom Data Components. Players drag and drop mystical rune stones onto weapons and armor to unlock devastating combat abilities with customized particle effects.

---

</div>

## 💎 The 6 Legendary Runes

| Rune Stone | Type | Effect & Mechanics |
|---|---|---|
| **🩸 Rune of the Vampire** | Weapon | Siphons **25%** of inflicted melee damage into player health with crimson heart auras. |
| **⚡ Rune of the Tempest** | Weapon | **25%** chance on strike to call down celestial lightning dealing +4.0 bonus shock damage without block destruction. |
| **🌪️ Rune of the Gale** | Weapon / Boots | Propels user with Breeze gust acceleration and knocks back targets. |
| **❄️ Rune of Cryo Stasis** | Weapon | Envelops victims in frostbite, inflicting Slowness III for 3.5 seconds with blizzard particles. |
| **🔥 Rune of the Phoenix** | Armor | Completely negates lethal damage, fully restoring hearts, triggering fire resistance and totem auras (5m cooldown). |
| **🛡️ Rune of the Colossus** | Chestplate | Hardens armor, deflecting **20%** of incoming physical damage directly back to attackers. |

---

## ⚡ Socketing Mechanic

Players do not need complicated commands to socket runes.
1. Open player inventory (`E`).
2. Pick up the Rune Stone with your mouse cursor.
3. Left-click directly onto any Sword, Axe, Bow, Crossbow, or Armor piece.
4. The rune permanently binds into the item's Data Components with custom glowing lore and ambient particle halos!

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/aquarunes give <player> <rune_id>` | `aquarunes.admin` | Grants a legendary rune stone |
| `/aquarunes list` | `aquarunes.admin` | Lists all registered runes and properties |
| `/aquarunes reload` | `aquarunes.admin` | Reloads particle and damage settings |

---

## 🛠️ Build from Source

```bash
git clone https://github.com/efekkoc/AquaRunes.git
cd AquaRunes
mvn clean package
```

---

## 👨‍💻 Author

Created with ❤️ by **Turgut Efekan Koç** ([@efekkoc](https://github.com/efekkoc))  
Part of the **AquaForge Modern Minecraft Ecosystem**.
