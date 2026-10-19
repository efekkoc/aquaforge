# ⚔️ AquaCombat

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Universal Anti-CombatLog, Dynamic BossBar & PvP Tag Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure competitive PvP integrity.

---

## ✨ Features

- 🛑 **Punish Combat Logging**: If a tagged player quits or disconnects during battle, they are instantly slain and their inventory drops naturally.
- 📊 **Dynamic Smooth BossBar Countdown**: Real-time notched 10-segment boss bar updates remaining combat seconds.
- 🚫 **Command Blacklist Enforcement**: Blocks `/spawn`, `/home`, `/tpa`, `/rtp`, `/ah` during active PvP engagements.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully supports 1.21.1, 1.21.4, and 1.21.11 Mounts of Mayhem.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/combattag` (or `/ct`) | `aquacombat.use` | Check remaining combat tag countdown |
| *(Combat Bypass)* | `aquacombat.bypass` | Immunity to combat tags and command blocks |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  combat_duration_seconds: 15
  kill_on_combat_quit: true
  drop_items_on_combat_quit: true

blocked_commands_during_combat:
  - "spawn"
  - "home"
  - "tp"
  - "tpa"
  - "warp"
  - "rtp"
  - "ah"
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
