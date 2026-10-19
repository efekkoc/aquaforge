# 📊 AquaScoreboard

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Flicker-Free RGB Sidebar Scoreboard & Modern Tablist Header/Footer Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure team-prefix packet buffering.

---

## ✨ Features

- 🖥️ **Flicker-Free Packet Engine**: Eliminates scoreboard blinking via virtual Team packet caching.
- 🌈 **Native MiniMessage Gradients**: Smooth hex transitions, rainbow gradients, and animated server titles.
- 📋 **Modern Tablist Header & Footer**: Live player count, network ping meters, and store announcements.
- 👁️ **Per-Player Toggle (`/sb`)**: Players can cleanly minimize the scoreboard for uncluttered recordings.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully tested across 1.21.1, 1.21.4, and 1.21.11.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/sb` (or `/sidebar`) | `aquascoreboard.toggle` | Toggle scoreboard visibility on/off |
| `/sbreload` | `aquascoreboard.admin` | Hot-reload scoreboard strings and tablist |

---

## 🛠️ Configuration (`config.yml`)

```yaml
scoreboard:
  title: "<gradient:#00d2ff:#3a7bd5><b>AQUAFORGE NETWORK</b></gradient>"
  lines:
    - "<gray>Player: <gold>%player%"
    - "<gray>Rank: <aqua>%rank%"
    - "<gray>Balance: <green>$%balance%"
    - "<gray>Ping: <white>%ping% ms"
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
