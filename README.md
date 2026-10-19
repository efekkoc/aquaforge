<div align="center">

# ⚡ AquaForge
### Next-Gen Minecraft Server Orchestrator, Plugin Diagnostic Engine & Marketplace Hub

[![Paper 1.21.4](https://img.shields.io/badge/PaperMC-1.21.4-blue?style=for-the-badge&logo=curseforge&logoColor=white)](https://papermc.io)
[![Java 21](https://img.shields.io/badge/Java-21_LTS-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<p align="center">
  <b>AquaForge</b> is an all-in-one developer suite and server orchestrator built for high-performance Minecraft (Paper/Purpur) environments.<br/>
  Engineered specifically for plugin developers and network administrators to eliminate the friction of debugging, deploying, and monitoring Paper 1.21+ plugins.
</p>

[Key Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Diagnostics Engine](#-stack-trace-diagnostic-studio) • [Dev-Sync](#-live-dev-sync--hot-swap) • [Author](#-author)

---

</div>

## 🌟 Key Features

### 🔍 1. Real-Time Stack Trace Diagnostic Studio (Bug Hunter)
- **Automatic Exception Interception**: Real-time log parser intercepts crashes and unhandled exceptions (`NullPointerException`, `ConcurrentModificationException`, `EventException`, `ClassNotFoundException`, `ScannerException`).
- **Culprit Isolation**: Pinpoints the exact plugin, Java package, source file, and line number (e.g., `PlayerFishListener.java:84`).
- **AI / Rule-Based Code Patching**: Generates production-ready Java code suggestions with defensive null-checks, concurrent collections, or Aikar flag recommendations.
- **Exportable Reports**: 1-click Markdown bug export for issue trackers and dev team handoffs.

### ⚡ 2. Live Dev-Sync & Hot-Swap (Watch Daemon)
- **Eliminate Manual Drag & Drop**: Watches your plugin build directory (e.g., `AquaFishing/build/libs/`) via native file-system events (`chokidar`).
- **Instant Deployment**: As soon as `./gradlew build` completes on macOS/Windows, the compiled `.jar` is immediately synced to the server's `plugins/` directory.

### 📦 3. Plugin Vault & Marketplace (CurseForge / Modrinth Style)
- **Live Jar Inspection**: Directly parses `plugin.yml` and `paper-plugin.yml` from inside `.jar` files (extracting versions, main classes, API version, and dependencies).
- **1-Click Enable/Disable**: Toggle plugins without deleting files (`.jar` ⇋ `.jar.disabled`).
- **GitHub Releases Integration**: Automatically synchronizes releases from [`efekkoc/AquaFishing`](https://github.com/efekkoc/AquaFishing) and [`efekkoc/AquaMap`](https://github.com/efekkoc/AquaMap) with 1-click server deployment.
- **Modrinth Store**: Instant search and installation of essential community plugins (*LuckPerms, spark, WorldEdit, Chunky, ProtocolLib*).

### ⚙️ 4. In-Browser YAML Config Studio & Validator
- **Crash Prevention**: Minecraft servers often crash due to illegal `TAB` characters or bad indentation in `config.yml`.
- **Live Syntax Linter**: Checks syntax before the server boots.
- **Auto-Fix Indentation**: 1-click conversion from tab characters to standard 2-space YAML formatting.
- **Automatic Backups**: Creates safe `.backup` files before writing any disk modifications.

### 🎨 5. Resource Pack CDN & Cryptographic SHA-1 Generator
- **Designed for Custom Item & RPG Plugins**: Built to serve custom models and textures (such as `AquaFishing`'s custom bossbars and 3D fish models).
- **Byte-Accurate SHA-1**: Calculates hexadecimal SHA-1 checksums using `crypto`.
- **Server Properties Sync**: 1-click auto-configuration of `resource-pack` URL and `resource-pack-sha1` in `server.properties`.

### 📊 6. Interactive Terminal & Metrics HUD
- **Bidirectional WebSocket Stream**: Colorized ANSI terminal with command history (arrow up/down) and quick command chips (`/tps`, `/spark`, `/reload`).
- **Hardware & Game Metrics**: Live gauges for 20.0 TPS, MSPT tick budget (50ms limit), JVM Heap memory, CPU %, and connected player count.

---

## 🏛 Architecture

```
aquaforge/
├── server/                   # Node.js + TypeScript Backend Orchestrator
│   ├── src/
│   │   ├── services/
│   │   │   ├── DiagnosticEngine.ts    # Stack trace parser & Java code advisor
│   │   │   ├── ServerProcessManager.ts # ChildProcess manager (Paper/Purpur)
│   │   │   ├── PluginManager.ts       # AdmZip plugin.yml reader & toggle
│   │   │   ├── MarketplaceService.ts  # GitHub API & Modrinth proxy
│   │   │   ├── DevSyncService.ts      # Chokidar file watcher daemon
│   │   │   ├── ConfigInspector.ts     # YAML validator & indentation fixer
│   │   │   └── ResourcePackService.ts # SHA-1 checksum & HTTP CDN
│   │   ├── types.ts                   # Strongly-typed schemas
│   │   └── index.ts                   # Express & WebSocket Server (Port 4000)
│   └── server_data/                   # Server root, plugins/, resourcepacks/
│
├── client/                   # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Server controls & quick HUD
│   │   │   ├── Sidebar.tsx            # Navigation & author profile
│   │   │   ├── DashboardView.tsx      # TPS/MSPT dials & hardware metrics
│   │   │   ├── ConsoleView.tsx        # Colorized ANSI terminal
│   │   │   ├── DiagnosticsView.tsx    # Bug Hunter & code patch studio
│   │   │   ├── PluginsView.tsx        # Installed, GitHub repos, Modrinth
│   │   │   ├── DevSyncView.tsx        # File-system build watchers
│   │   │   ├── ConfigView.tsx         # YAML editor & auto-fixer
│   │   │   └── ResourcePackView.tsx   # SHA-1 calculator & CDN sync
│   │   ├── utils/ansi.ts              # Terminal escape sequence parser
│   │   └── App.tsx                    # WebSocket client & view router
│   └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (Node 20+ or 26 recommended)
- **Java 21 LTS** (for running actual Paper 1.21.x server instances)
- macOS, Linux, or Windows

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/efekkoc/aquaforge.git
   cd aquaforge
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Start the Development Suite:**
   ```bash
   # From root:
   npm run dev

   # Or run concurrently in two terminals:
   # Terminal 1: cd server && npm run dev
   # Terminal 2: cd client && npm run dev
   ```

4. **Open in Browser:**
   ```
   http://localhost:5173
   ```

> **Note:** AquaForge includes a built-in **Dev / Simulation Engine**. If a physical `paper.jar` is not present in `server_data/`, it safely boots into an intelligent dev mode with realistic Paper 1.21.4 logs, 20.0 TPS jitter, and sample diagnostics so you can showcase the entire platform immediately.

---

## 🎯 Showcased Minecraft Plugins by Author

AquaForge seamlessly integrates with the author's custom plugins:

- 🎣 **[AquaFishing](https://github.com/efekkoc/AquaFishing)**: Advanced RPG fishing plugin for Paper 1.21+ featuring 40 custom fish, reeling mini-game, 10 rod tiers, and custom bossbars.
- 🗺 **[AquaMap](https://github.com/efekkoc/AquaMap)**: Clientless live minimap, player radar, and HUD compass plugin for Paper 1.21.x built with Java 21 async architecture.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for personal, community, and enterprise Minecraft server networks.

Created with 💙 by **[Turgut Efekan Koç (efekkoc)](https://github.com/efekkoc)**.
