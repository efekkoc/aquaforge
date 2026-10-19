# 💬 AquaChat

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Enterprise RGB Gradient Chat, Channel Switcher & Hoverable Item Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, built on native Kyori Adventure components.

---

## ✨ Features

- 🌈 **Native Kyori Adventure & MiniMessage**: Smooth RGB gradients, hex colors (`#RRGGBB`), and hover effects without lag.
- 📡 **Multi-Channel Architecture**: Switch seamlessly between `Global`, `Local` (spherical block radius), and `Staff` channels via `/ch <channel>`.
- 🎁 **Item Showcase (`/item`)**: Instantly broadcast held items in chat with interactive details.
- 🔔 **Auditory Mention Pings**: Plays subtle note-block chimes when a player's username is tagged in chat.
- ⏱️ **Spam & Flooding Guard**: Intelligent per-player message rate throttling with permission-based bypass.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully tested across 1.21.1, 1.21.4, and the modern 1.21.11 ecosystem.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/channel [global\|local\|staff]` | `aquachat.user` | Switch between chat transmission channels |
| `/item` | `aquachat.item` | Showcase held item in global chat |
| *(Staff Channel)* | `aquachat.staffchat` | Permission to view and broadcast in staff chat |
| *(Spam Bypass)* | `aquachat.bypass.cooldown` | Immunity to chat rate limits |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  enable_hex_colors: true
  enable_mention_ding: true
  mention_sound: "BLOCK_NOTE_BLOCK_BELL"

channels:
  global:
    prefix: "<gradient:#00d2ff:#3a7bd5>[Global]</gradient> "
  local:
    prefix: "<gradient:#11998e:#38ef7d>[Local]</gradient> "
    radius: 100
  staff:
    prefix: "<gradient:#ff416c:#ff4b2b>[Staff]</gradient> "
    permission: "aquachat.staffchat"
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
