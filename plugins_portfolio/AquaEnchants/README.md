# ⚡ AquaEnchants

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Universal VeinMiner, Timber, Auto-Smelt & Telepathy Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, native bread-first search cluster mining.

---

## ✨ Features

- ⛏️ **VeinMiner (`Shift + Mine`)**: Instant cluster mining for Diamond, Deepsalte, Gold, and Iron veins.
- 🪓 **Timber Tree Chopper**: Fells entire vertical tree columns in one fell swoop.
- 🔥 **Auto-Smelt Mechanics**: Converts raw ores directly into ingots upon excavation.
- 🧲 **Telepathy Loot Delivery**: Transports block drops straight into player inventories without entity item lag.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully supports modern 1.21 Data Components and Trial Chamber blocks.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/enchants` | `aquaenchants.use` | View custom abilities & mining instructions |
| `/givebook <enchant> [player]` | `aquaenchants.admin` | Award custom ability books |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  enable_vein_miner: true
  vein_miner_max_blocks: 64
  enable_timber: true
  enable_auto_smelt: true
  enable_telepathy: true
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
