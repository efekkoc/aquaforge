# 🎯 AquaBounties

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Player Head Bounties, Bounty Hunter Tracker & PvP Rivalry Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure competitive gameplay retention.

---

## ✨ Features

- 💀 **Player Head Bounties (`/bounty set <player> <amount>`)**: Place cash bounties on rival players to incite community hit contracts.
- 🧭 **Hunter Tracking Compass (`/hunter`)**: Dynamic tracking compass locks onto the coordinates of target players.
- 🏆 **Trophy Head Drops**: Automatically decapitates defeated bounty targets and awards their collectible head to the killer.
- 📢 **Global Broadcasts & Leaderboards**: Live announcements and top-5 active bounties ranking.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully compatible with 1.21.1, 1.21.4, and 1.21.11.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/bounty top` | `aquabounties.use` | View the top 5 highest active bounties |
| `/bounty set <player> <amount>` | `aquabounties.use` | Place a bounty on an active player |
| `/hunter` | `aquabounties.track` | Acquire a hunter tracking compass |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  minimum_bounty: 100.0
  bounty_tax_percent: 5.0
  drop_victim_skull_on_kill: true
  broadcast_bounty_placed: true
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
