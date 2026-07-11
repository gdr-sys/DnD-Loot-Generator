<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.5-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/D%26D-5e%20%2F%202024-E40712?style=for-the-badge&logo=dungeonsanddragons&logoColor=white" alt="D&D" />
  <img src="https://img.shields.io/badge/lang-EN%20%7C%20IT-yellow?style=for-the-badge" alt="Languages" />
  <img src="https://img.shields.io/badge/magic_items-400%2B-purple?style=for-the-badge" alt="Items" />
  <img src="https://img.shields.io/badge/tables-29-orange?style=for-the-badge" alt="Tables" />
  <img src="https://img.shields.io/badge/build-~460KB_single_file-success?style=for-the-badge" alt="Build" />
</p>

---

<h1 align="center">🎲 D&D Loot Generator</h1>

<p align="center">
  <strong>Treasure Generator for Dungeons & Dragons</strong><br/>
  A web tool for Dungeon Masters to quickly generate random treasure<br/>
  following the official tables from the <b>DMG 2014</b> and <b>DMG 2024</b>.
</p>

<p align="center">
  🌐 <b>Bilingual</b>: English 🇬🇧 &amp; Italian 🇮🇹
</p>

<p align="center">
  <a href="https://ko-fi.com/noemimarcolini"><img src="https://img.shields.io/badge/Ko--fi-Support_the_creator-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi" /></a>
  <a href="https://gdr-sys-portfolio2026.vercel.app/"><img src="https://img.shields.io/badge/Portfolio-More_GDR_Tools-4F46E5?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" /></a>
</p>

---

## ✨ Features

### 📚 Two Editions Supported
| Edition | Source | Content |
|---------|--------|---------|
| **DMG 2014** | Ch. 7, p. 136–149 | Individual Treasure + Treasure Hoard + Tables A–I + Subtables |
| **DMG 2024** | Ch. 6–7, p. 120 + 326–330 | Individual + Hoard + 4 Themes × 5 Rarities (20 tables) |

### 🎯 Three Generation Modes
| Mode | Description | Editions |
|------|-------------|----------|
| 👤 **Individual Treasure** | Loot from a single monster/NPC | 2014, 2024 |
| 💰 **Treasure Hoard** | Full dungeon/lair hoard (coins + gems + art + magic items) | 2014, 2024 |
| ✨ **Magic Item by Theme** | Generate a single magic item by theme and rarity | 2024 only |

### 💎 Generated Content
- 🪙 **Coins** — CP, SP, EP, GP, PP with DMG formulas
- 💎 **Gemstones** — 12 types across 6 value tiers (10–5,000 gp), translated EN/IT
- 🎨 **Art Objects** — 10 objects across 5 value tiers (25–7,500 gp), translated EN/IT
- ✨ **Magic Items** — 400+ items with name, description, and rarity in EN/IT
- 📊 **Auto-calculated totals** for gems and art objects value

### 🎨 Interface
- 🌙 **Dark / ☀️ Light / 💻 System** theme with persistence
- 📱 **Mobile-first** responsive — touch targets ≥56px, font ≥16px
- 📜 **Bottom sheet** for magic item details with full translation
- 🕐 **History** of last 50 rolls (localStorage)
- 📋 **Copy** to clipboard + 📤 **Share** (Web Share API)
- ♿ Respects `prefers-reduced-motion` for accessibility

### 🌍 Full Localization
| Element | EN 🇬🇧 | IT 🇮🇹 |
|---------|--------|--------|
| UI interface | ✅ | ✅ |
| Magic items (name + description) | ✅ | ✅ |
| Gemstones | ✅ | ✅ |
| Art objects | ✅ | ✅ |
| Coin names | GP, SP, CP, EP, PP | MO, MA, MR, ME, MP |

---

## 🚀 Quick Start

### Online
Open the app in your browser → select edition → press 🎲

### Local Development
```bash
# Clone
git clone <repo-url>
cd dnd-loot-generator

# Install dependencies
npm install

# Dev server (hot reload)
npm run dev

# Production build → dist/index.html (single file ~460KB)
npm run build

# Preview production build
npm run preview
```

---

## 📖 How It Works

### DMG 2014
```
Select CR → Select Type → 🎲 Roll
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Individual      Hoard Base       Hoard d100
          (d100)          Coins            Roll
              │               │               │
              ▼               ▼               ▼
           Coins           Coins       Gems/Art/Magic
                                      Items (Tables A–I)
                                            │
                                      ┌─────┼─────┐
                                      ▼     ▼     ▼
                                   Figurine  Magic  Normal
                                   Sub(d8)  Armor   Item
                                           Sub(d12)
```

### DMG 2024
```
Select CR → Select Type → 🎲 Roll
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Individual        Hoard         Magic Item
       (direct formula)     │            by Theme
              │             ▼               │
              ▼           GP base      ┌────┼────┐
           Coins          + N items    ▼    ▼    ▼
                              │      Theme Rarity d100
                     For each item:      │
                     1d2 rarity          ▼
                     1d4 theme        Item
                     d100 table
```

---

## 🗂️ Project Structure

```
dnd-loot-generator/
│
├── 📄 index.html                        # HTML entry point + PWA meta tags
├── 📄 README.md                         # ← This file
├── 📄 DEVELOPMENT.md                    # Technical guide + ALL official tables
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 tsconfig.json
│
├── 📁 public/
│   └── manifest.json                   # PWA manifest
│
└── 📁 src/
    ├── App.tsx                          # 🎯 Main component (UI + state + routing)
    ├── main.tsx                         # React entry point
    ├── index.css                        # Global styles + CSS animations
    │
    ├── 📁 core/                         # 🎲 Game engine
    │   ├── dice.ts                      # rollDie, rollDice, rollPercent, pick
    │   ├── generator2014.ts             # DMG 2014 generation logic
    │   └── generator2024.ts             # DMG 2024 generation logic
    │
    ├── 📁 data/                         # 📊 Data & tables
    │   ├── tables2014.ts               # Official DMG 2014 tables (Individual + Hoard + A–I)
    │   ├── tables2024.ts               # Official DMG 2024 tables (20 theme×rarity tables)
    │   └── magic-items-database.ts     # 400+ magic items database EN/IT + fuzzy lookup
    │
    └── 📁 i18n/                         # 🌍 Internationalization
        ├── translations.ts             # UI translations (EN/IT)
        └── translations-items.ts       # Gem & art object translations (EN/IT)
```

---

## 📊 Implemented Tables

### DMG 2014 — 9 Tables
| # | Table | Source | Entries |
|---|-------|--------|---------|
| 1 | Individual Treasure CR 0–4 | p. 136 | 5 rows |
| 2 | Individual Treasure CR 5–10 | p. 136 | 5 rows |
| 3 | Individual Treasure CR 11–16 | p. 136 | 4 rows |
| 4 | Individual Treasure CR 17+ | p. 136 | 3 rows |
| 5 | Treasure Hoard CR 0–4 | p. 137 | 17 rows |
| 6 | Treasure Hoard CR 5–10 | p. 137 | 29 rows |
| 7 | Treasure Hoard CR 11–16 | p. 138 | 33 rows |
| 8 | Treasure Hoard CR 17+ | p. 138 | 25 rows |
| 9 | Magic Item Tables A–I | p. 144–149 | 454 entries total |

**+ 2 Subtables**: Figurine of Wondrous Power (d8), Magic Armor (d12)

### DMG 2024 — 20 Tables
| # | Theme | Rarities | Source | Entries |
|---|-------|----------|--------|---------|
| 1–5 | Arcana | Common → Legendary | p. 326 | 217 |
| 6–10 | Armaments | Common → Legendary | p. 328 | 118 |
| 11–15 | Implements | Common → Legendary | p. 329 | 122 |
| 16–20 | Relics | Common → Legendary | p. 330 | 85 |

**Grand total: 29 tables with 700+ rows of data**

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18 | UI components + hooks |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Vite](https://vitejs.dev/) | 7 | Build tool + dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first styling |
| [vite-plugin-singlefile](https://github.com/nickreese/vite-plugin-singlefile) | — | Bundle everything into one HTML |

**Zero external runtime dependencies.** Output: a single `dist/index.html` (~460KB, ~124KB gzip).

---

## 📱 PWA

The app is installable as a Progressive Web App:

| Feature | Status |
|---------|--------|
| `manifest.json` | ✅ |
| Standalone mode | ✅ |
| Offline support (single-file) | ✅ |
| iPhone safe areas | ✅ |
| Theme color | `#0d0d1a` |

---

## 💾 Persistence (localStorage)

| Key | Value | Default |
|-----|-------|---------|
| `lang` | `"en"` \| `"it"` | `"en"` |
| `themeMode` | `"dark"` \| `"light"` \| `"system"` | `"dark"` |
| `rollHistory` | JSON array (max 50 entries) | `[]` |

---

## 📜 License

Personal project by **Noemi Marcolini** — [MIT License](./LICENSE)

> ⚠️ **Disclaimer**: D&D, Dungeons & Dragons, and all related names are registered trademarks of Wizards of the Coast LLC. This tool is a fan-made project not affiliated with Wizards of the Coast. The tables are implementations of rules published in the official manuals for personal use by players.

---

<p align="center">
  <i>Built with ❤️ by <a href="https://ko-fi.com/noemimarcolini">Noemi Marcolini</a></i>
</p>

<p align="center">
  <a href="https://ko-fi.com/noemimarcolini"><img src="https://img.shields.io/badge/☕_Support_the_creator-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi" /></a>
  <a href="https://gdr-sys-portfolio2026.vercel.app/"><img src="https://img.shields.io/badge/⚔️_More_GDR_Tools-Portfolio-4F46E5?style=flat-square&logo=vercel&logoColor=white" alt="Portfolio" /></a>
</p>
