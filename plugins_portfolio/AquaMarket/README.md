# 🛒 AquaMarket

[![Minecraft Version](https://img.shields.io/badge/Minecraft-1.20.x--1.21.11-00d2ff.svg?style=for-the-badge&logo=minecraft)](https://papermc.io)
[![Paper Supported](https://img.shields.io/badge/Platform-Paper%20%7C%20Purpur-3a7bd5.svg?style=for-the-badge)](https://papermc.io)
[![Author](https://img.shields.io/badge/Author-Turgut%20Efekan%20Koç%20(efekkoc)-10b981.svg?style=for-the-badge)](https://github.com/efekkoc)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg?style=for-the-badge)](LICENSE)

> **High-Performance Global Auction House & Player Marketplace Engine** for Paper / Purpur 1.20.x through **1.21.11 (Mounts of Mayhem)**. Zero external dependencies, pure in-memory listings with mailbox fallback.

---

## ✨ Features

- 🏪 **Interactive Virtual Auction GUI (`/ah`)**: 54-slot responsive auction house with pagination and sorting.
- 📦 **1.21.x Modern Data Components**: Fully supports weapon runic sockets, Nautilus gear, spears, and custom lore without data corruption.
- 📬 **Player Return Mailbox (`/ah mailbox`)**: Expired or cancelled items are safely routed to player personal mailboxes to eliminate inventory drop loss.
- 💸 **Sales Tax & Inflation Engine**: Configurable listing and transaction fees to maintain a healthy long-term server economy.
- ⚡ **Universal Multi-Version Support**: Built natively for 1.20.x – 1.21.11 (optimized for 1.21.1, 1.21.4, and 1.21.11).

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/ah` | `aquamarket.use` | Open the global auction house menu |
| `/ah sell <price>` | `aquamarket.sell` | List the currently held item on the market |
| `/ah mailbox` | `aquamarket.use` | Collect expired or purchased items from your mailbox |
| `/marketadmin clear` | `aquamarket.admin` | Clear all active market listings |

---

## 🛠️ Configuration (`config.yml`)

```yaml
settings:
  engine_version: "1.21.11-Universal"
  listing_duration_hours: 48
  max_listings_per_player: 10
  sales_tax_percent: 5.0
  min_listing_price: 10.0
```

---

## 👨‍💻 Author & Maintainer

Authored by **Turgut Efekan Koç ([@efekkoc](https://github.com/efekkoc))** as part of the **AquaForge Flagship Server Ecosystem**.
