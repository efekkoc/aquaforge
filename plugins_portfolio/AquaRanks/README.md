# 👑 AquaRanks

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **Lightweight In-Memory Ranks, Prefixes & Permission Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure native Kyori player list formatting without heavy LuckPerms SQL bloat.

---

## ✨ Features

- ⚡ **Ultra-Fast In-Memory Permissions**: Zero database latency; instant rank assignment and permission evaluation.
- 🌈 **Gradient Overhead & Tablist Prefixes**: Beautiful mini-message tags formatted in player list names.
- 🎯 **Simple Administration (`/rank set`)**: Easy command syntax designed for fast server management.
- 🛡️ **Inheritance & Hierarchy Weights**: Priority based rank sorting and prefix cascades.
- ⚡ **Universal 1.20.x – 1.21.11 Compatibility**: Fully compatible with 1.21.1, 1.21.4, and 1.21.11.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/rankinfo` | `aquaranks.use` | View your personal active rank and prefix |
| `/rank set <player> <rank>` | `aquaranks.admin` | Change a player's rank |
| `/rank list` | `aquaranks.admin` | View all configured ranks |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  default_rank: "member"

ranks:
  owner:
    prefix: "<gradient:#ff416c:#ff4b2b><b>[OWNER]</b></gradient> "
    weight: 100
  admin:
    prefix: "<gradient:#f12711:#f5af19><b>[ADMIN]</b></gradient> "
    weight: 80
  vip:
    prefix: "<gradient:#38ef7d:#11998e><b>[VIP]</b></gradient> "
    weight: 20
  member:
    prefix: "<gray>[Member] "
    weight: 1
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
