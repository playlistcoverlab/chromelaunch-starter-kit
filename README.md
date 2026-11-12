# ⚡ ChromeLaunch - Production-Ready Chrome Extension Starter Kit

> Build, ship, and monetize modern Manifest V3 Chrome Extensions in hours instead of weeks. Powered by **React 19**, **Tailwind CSS v4**, **TypeScript**, **Chrome Side Panel API**, and built-in **Stripe / ExtensionPay Monetization**.

---

## 🚀 Key Features

- **🛡️ 100% Manifest V3 Compliant:** Future-proof architecture with service workers, proper declarative permissions, and zero deprecated V2 APIs.
- **⚡ Chrome Side Panel (Chrome 114+):** Pre-configured native side panel that stays open while users browse, ideal for AI copilots, notes, and productivity tools.
- **🎨 Sleek Dark-Mode UI:** Built with **Tailwind CSS v4** + modern **shadcn-inspired** aesthetics and Lucide icons.
- **💳 Built-in Stripe Monetization:** Pre-integrated with **ExtensionPay** (Stripe for extensions). Includes paywall modal, subscription hooks (`useExtensionPay`), and a built-in **Local Dev Simulator** to test PRO features with zero config.
- **🧩 3 Core Extension Surfaces:**
  - `popup`: Sleek 380px action popup with live tab inspection and tools.
  - `sidepanel`: Persistent workspace with chat/copilot feed and Markdown export.
  - `options`: Full dashboard for API keys, theme preferences, and data backups.
- **📡 Isolated Content Script:** Injects floating action trigger via **Shadow DOM** to prevent CSS collisions with host websites.
- **⚡ Blazing Fast Build (Bun + Vite):** Compiles the entire unpacked extension in under **1 second** (`bun run build`).

---

## 📦 Quickstart in 2 Minutes

### 1. Install & Build
```bash
# Clone and enter directory
cd chromelaunch-kit

# Install dependencies with Bun
bun install

# Build unpacked extension for Chrome
bun run build
```

### 2. Load into Google Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle on **"Developer mode"** (top right switch).
3. Click **"Load unpacked"** (top left button).
4. Select the `dist/` directory inside `chromelaunch-kit`.
5. Pin the extension to your toolbar and click to open!

---

## 💳 How Monetization Works (Stripe in 3 Minutes)

ChromeLaunch comes pre-wired with **ExtensionPay** (the official, compliant Stripe integration for browser extensions):

1. Go to [extensionpay.com](https://extensionpay.com) and create a free account.
2. Register your extension name and connect your Stripe account.
3. Open `src/lib/extpay.ts` and update your ID:
   ```typescript
   export const EXTENSION_ID = "tu-extension-id-aqui";
   export const USE_SIMULATOR_IN_DEV = false; // Set to false when ready for real Stripe checkout
   ```
4. That's it! When users click **Upgrade**, a secure Stripe checkout page opens automatically, and features are unlocked instantly.

> 💡 **Built-in Local Simulator:** While developing, you don't even need a Stripe account. The header includes a `[Dev: Activar Pro]` button that simulates successful payments instantly in localStorage.

---

## 📁 Project Architecture

```
chromelaunch-kit/
├── dist/                          # Production unpacked extension (load this into Chrome)
├── public/
│   ├── manifest.json              # Chrome Manifest V3 declaration
│   └── icons/                     # 16x16, 32x32, 48x48, 128x128 PNG icons
├── src/
│   ├── background/
│   │   └── index.ts               # Background Service Worker & Message Router
│   ├── content/
│   │   └── index.ts               # Content script with Shadow DOM floating badge
│   ├── popup/                     # Action popup surface
│   ├── sidepanel/                 # Chrome Side Panel surface
│   ├── options/                   # Settings & Options dashboard
│   ├── components/                # Reusable UI (Header, PaywallModal, etc.)
│   ├── lib/
│   │   ├── extpay.ts              # Stripe / ExtensionPay monetization hook & client
│   │   ├── storage.ts             # Typed chrome.storage.local wrapper
│   │   ├── messaging.ts           # Type-safe cross-script communication
│   │   └── utils.ts               # cn class utility
│   └── styles/
│       └── globals.css            # Tailwind CSS v4 directives & sleek scrollbars
├── vite.config.ts                 # Multi-entry Vite bundler configuration
└── package.json
```

---

## 🚢 Publishing to the Chrome Web Store

1. Run `bun run build`.
2. Compress the contents of the `dist/` folder into a `.zip` file (do NOT zip the folder itself, zip the files inside `dist`).
3. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Click **"New Item"** and upload your `.zip`.
5. Add your title, screenshots, description, and submit for review.

---

## 📄 License

Commercial License included in [LICENSE](LICENSE). You may use this boilerplate to build and sell unlimited commercial extensions.
