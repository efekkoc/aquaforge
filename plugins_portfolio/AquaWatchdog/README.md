<div align="center">

# 🐕 AquaWatchdog
### CPS, Reach & Packet Anomaly Inspector with Discord & AquaForge Webhook Triage

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![PaperMC](https://img.shields.io/badge/PaperMC-1.21.4-blue?logo=minecraft)
![AntiCheat](https://img.shields.io/badge/Anti--Cheat-Packet%20Telemetry-red)
![License](https://img.shields.io/badge/License-MIT-teal)
[![GitHub](https://img.shields.io/badge/Author-efekkoc-cyan?logo=github)](https://github.com/efekkoc)

**AquaWatchdog** is a lightweight, high-performance telemetry engine and anti-cheat triage module designed for modern Paper 1.21.4 networks. It tracks combat packet anomalies (AutoClickers / Macros, Raycast Reach violations) and seamlessly reports alerts directly to staff and external webhooks (Discord / AquaForge Studio).

---

</div>

## 🎯 Detection Modules

### 1. 🥊 Vector Reach Detection
- Raycasts eye position to target bounding box taking victim velocity into account.
- Flags attacks exceeding vanilla survival limits (> 3.05 blocks).
- Optional hit cancellation upon detection to prevent unfair PvP advantages.

### 2. ⚡ Sliding-Window CPS Inspector
- Tracks click timestamps across a 1,000ms sliding window.
- Flags sustained click rates exceeding human limits (> 20 CPS).
- Detects non-fluctuating macro intervals (consistent 0ms variance).

### 3. 🌐 Webhook & Studio Triage
- Asynchronously sends JSON alert payloads to configured Discord or AquaForge webhook endpoints without stalling main server tick thread.
- Includes player UUID, latency (ping), violation metric, and timestamp.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/watchdog check <player>` | `aquawatchdog.staff` | Live telemetry inspection (ping, position, gamemode) |
| `/watchdog testwebhook` | `aquawatchdog.staff` | Dispatches a synthetic alert to test webhooks |
| `/watchdog reload` | `aquawatchdog.staff` | Hot-reloads threshold parameters |

---

## 🛠️ Build from Source

```bash
git clone https://github.com/efekkoc/AquaWatchdog.git
cd AquaWatchdog
mvn clean package
```

---

## 👨‍💻 Author

Created with ❤️ by **Turgut Efekan Koç** ([@efekkoc](https://github.com/efekkoc))  
Part of the **AquaForge Modern Minecraft Ecosystem**.
