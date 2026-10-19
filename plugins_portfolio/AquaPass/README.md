# 🎫 AquaPass

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Seasonal Battle Pass, Daily Quests & Dual-Track Reward Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure native GUI & action bar telemetry.

---

## ✨ Features

- 🏆 **Dual-Track Progression**: Free and Premium tiers with custom item and command execution rewards.
- 🎯 **Dynamic Gameplay Quests**: Grants Pass XP automatically on mob kills, ore mining, fishing, and dungeons.
- 📺 **Native Virtual GUI**: 54-slot interactive pass inspector with visual unlock state and sound feedback.
- 🚀 **Live Action Bar Popups**: Real-time XP telemetry whenever players make progress.
- 🛡️ **Admin Tooling (`/passadmin`)**: Live commands to award pass experience, reset seasons, and test tracks.
- ⚡ **Universal Multi-Version Support**: Engineered for 1.20.x – 1.21.11 (optimized for 1.21.1, 1.21.4, and 1.21.11).

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/pass` (aliases: `/bp`, `/battlepass`) | `aquapass.use` | Open interactive seasonal Battle Pass GUI |
| `/passadmin givexp <player> <amount>` | `aquapass.admin` | Award pass experience to an online player |
| *(Premium Track Access)* | `aquapass.premium` | Unlocks premium tier rewards |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  season_name: "Season I: Echoes of the Abyss"
  xp_per_tier: 1000
  max_tiers: 50

quests:
  mine_diamonds:
    name: "Deepslate Wealth"
    xp_reward: 250
  slay_mobs:
    name: "Monster Slayer"
    xp_reward: 300
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
