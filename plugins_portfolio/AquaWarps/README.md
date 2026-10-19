# 🌀 AquaWarps

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Universal Teleportation, Spawn, Homes, TPA & Safe-RTP Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, replacing EssentialsX with modern async teleport mechanics.

---

## ✨ Features

- 🌍 **Intelligent Safe-RTP (`/rtp`)**: Raycast ground scanner guarantees players never spawn inside water, lava pits, or suffocation blocks.
- ⏳ **Anti-Combat Teleport Warmup**: 3-second countdown timer with move-detection cancellation prevents PvP combat escape.
- 🏠 **Multi-Home Management (`/sethome`, `/home`)**: Flexible player homes with per-group limit overrides.
- 🤝 **Player-to-Player TPA (`/tpa`, `/tpaccept`)**: Clean, expiring teleport requests with instant acoustic feedback.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Async chunk loading prevents server tick freezes during large-distance teleportation.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/spawn` | `aquawarps.spawn` | Teleport to the global server spawn |
| `/setspawn` | `aquawarps.admin` | Set global spawn at your current coordinates |
| `/rtp` (or `/wild`) | `aquawarps.rtp` | Safely teleport into the wild |
| `/sethome [name]` | `aquawarps.home` | Save a personal teleport home |
| `/home [name]` | `aquawarps.home` | Teleport to your saved home |
| `/tpa <player>` | `aquawarps.tpa` | Send a teleport request to a player |
| `/tpaccept` | `aquawarps.tpa` | Accept an incoming teleport request |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  teleport_delay_seconds: 3
  cancel_on_move: true

rtp:
  min_radius: 500
  max_radius: 5000
  cooldown_seconds: 30
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
