<div align="center">

# 🛡️ AquaSecurity
### Enterprise 2FA & Admin Session Guard for Paper 1.20.x – 1.21.4

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![PaperMC](https://img.shields.io/badge/PaperMC-1.20.x--1.21.4-blue?logo=minecraft)
![Optimized](https://img.shields.io/badge/Optimized-1.21.1%20%7C%201.21.4-teal)
![RFC 6238](https://img.shields.io/badge/TOTP-RFC%206238-success)
![License](https://img.shields.io/badge/License-MIT-emerald)
[![GitHub](https://img.shields.io/badge/Author-efekkoc-cyan?logo=github)](https://github.com/efekkoc)

**AquaSecurity** protects Minecraft networks against compromised staff credentials, session hijacking, and unauthorized administrator logins through standard Time-based One-Time Password (TOTP) verification.

---

</div>

## ✨ Key Features

- 🔐 **Standard RFC 6238 TOTP Engine:** Native compatibility with Google Authenticator, Microsoft Authenticator, Authy, and 1Password without external native binaries.
- 🧊 **Total Player Lockdown:** Freezes player movement, blocks commands (except `/2fa`), disables block breaking/placing, inventory interactions, item drops, and PvP/PvE damage until authentication passes.
- ⚡ **IP Session Caching:** Smart 24-hour IP caching prevents tedious re-authentication for trusted staff reconnecting from the same verified IP.
- ⏱️ **Auto-Kick Timeout:** Unauthenticated connections are automatically disconnected after configurable grace period (default: 120s).
- 📜 **Administrative Override:** `/2fa reset <player>` enables server owners to recover accounts if staff lose access to their authenticator devices.

---

## 🚀 Installation & Setup

1. Drop `AquaSecurity-1.0.0.jar` into your Paper 1.21.4 `plugins/` directory.
2. Restart the server.
3. Configure `plugins/AquaSecurity/config.yml` according to your network policies.

### First-Time Admin Setup:
1. Log in with OP or permission `aquasecurity.require2fa`.
2. Type `/2fa setup` in chat.
3. Add the generated Base32 secret key into Google Authenticator or Authy.
4. Finalize with `/2fa verify <6-digit-code>`.

---

## 💻 Commands & Permissions

| Command | Permission | Description |
|---|---|---|
| `/2fa setup` | `aquasecurity.use` | Generates a new 2FA secret key |
| `/2fa verify <code>` | `aquasecurity.use` | Verifies and unlocks session |
| `/2fa status` | `aquasecurity.use` | Shows 2FA protection status |
| `/2fa reset <player>` | `aquasecurity.admin` | Resets a player's secret |

---

## 🛠️ Build from Source

```bash
git clone https://github.com/efekkoc/AquaSecurity.git
cd AquaSecurity
mvn clean package
```

---

## 👨‍💻 Author

Created with ❤️ by **Turgut Efekan Koç** ([@efekkoc](https://github.com/efekkoc))  
Part of the **AquaForge Modern Minecraft Ecosystem**.
