\# 🎲 D\&D Loot Generator v1.0.5



\*\*Generatore di Tesori per Dungeons \& Dragons\*\* — Un tool web per Dungeon Master per generare rapidamente tesori casuali seguendo le tabelle ufficiali del DMG 2014 e DMG 2024.



🌐 \*\*Bilingue\*\*: Inglese 🇬🇧 e Italiano 🇮🇹



\---



\## ✨ Funzionalità



\### 📚 Due Edizioni Supportate

\- \*\*DMG 2014\*\* — Tabelle classiche Individual Treasure e Treasure Hoard (Tables A–I)

\- \*\*DMG 2024\*\* — Nuovo sistema a 4 Temi × 5 Rarità (Arcana, Armaments, Implements, Relics)



\### 🎯 Tre Modalità di Generazione

\- \*\*Individual Treasure\*\* — Tesoro per singolo mostro/PNG

\- \*\*Treasure Hoard\*\* — Tesoro completo di un dungeon/tana (monete + gemme + arte + oggetti magici)

\- \*\*Magic Item by Theme\*\* \*(solo 2024)\* — Genera un singolo oggetto magico scegliendo tema e rarità



\### 💎 Contenuto Generato

\- \*\*Monete\*\*: CP, SP, EP, GP, PP con quantità casuali secondo le formule del DMG

\- \*\*Gemme\*\*: 12 tipi per 6 fasce di valore (10–5.000 gp), tradotte EN/IT

\- \*\*Oggetti d'Arte\*\*: 10 oggetti per 5 fasce di valore (25–7.500 gp), tradotti EN/IT

\- \*\*Oggetti Magici\*\*: 400+ oggetti con nome, descrizione e rarità in EN/IT



\### 🎨 Interfaccia

\- \*\*Dark/Light/System\*\* theme

\- \*\*Bottom sheet\*\* per dettagli oggetti magici

\- \*\*Cronologia\*\* degli ultimi 50 roll (salvati in localStorage)

\- \*\*Copia\*\* negli appunti e \*\*Condividi\*\* (Web Share API)

\- \*\*Totale valore\*\* per gemme e oggetti d'arte

\- \*\*Mobile-first\*\* responsive, touch targets ≥56px, font ≥16px

\- \*\*PWA\*\* installabile, funziona offline dopo il primo caricamento



\### 🌍 Localizzazione

\- Interfaccia completa in Inglese e Italiano

\- Tutti gli oggetti magici tradotti (nome + descrizione)

\- Gemme e oggetti d'arte tradotti

\- Nomi monete localizzati (GP→MO, SP→MA, ecc.)



\---



\## 🚀 Come Usare



\### Online

Apri l'app nel browser. Funziona su desktop e mobile.



\### Sviluppo Locale

```bash

\# Installa dipendenze

npm install



\# Avvia dev server

npm run dev



\# Build produzione (genera dist/index.html singolo file)

npm run build



\# Preview build

npm run preview

```



\---



\## 📖 Come Funziona



\### DMG 2014

1\. Scegli la fascia CR (0–4, 5–10, 11–16, 17+)

2\. Scegli il tipo (Individual o Hoard)

3\. Premi "🎲 Tira il Tesoro"

4\. Per \*\*Individual\*\*: tira d100 → trova riga → genera monete

5\. Per \*\*Hoard\*\*: genera monete base → tira d100 → gemme/arte/oggetti → tira sulle Magic Item Tables A–I



\### DMG 2024

1\. Scegli la fascia CR

2\. Scegli il tipo (Individual, Hoard, o Magic Item by Theme)

3\. Per \*\*Individual\*\*: formula diretta senza d100

4\. Per \*\*Hoard\*\*: genera GP → tira numero oggetti → per ognuno: 1d2 rarità + 1d4 tema + d100

5\. Per \*\*Magic Item by Theme\*\*: scegli tema e rarità → tira d100



\---



\## 🗂️ Struttura Progetto



```

├── src/

│   ├── App.tsx                          # Componente principale (UI + state)

│   ├── main.tsx                         # Entry point React

│   ├── index.css                        # Stili globali + animazioni

│   ├── core/

│   │   ├── dice.ts                      # Funzioni dadi (rollDie, rollDice, pick...)

│   │   ├── generator2014.ts             # Logica generazione DMG 2014

│   │   └── generator2024.ts             # Logica generazione DMG 2024

│   ├── data/

│   │   ├── tables2014.ts               # Tabelle ufficiali DMG 2014

│   │   ├── tables2024.ts               # Tabelle ufficiali DMG 2024 (20 tabelle)

│   │   └── magic-items-database.ts     # Database 400+ oggetti magici EN/IT

│   └── i18n/

│       ├── translations.ts             # Traduzioni UI (EN/IT)

│       └── translations-items.ts       # Traduzioni gemme e oggetti d'arte

├── public/

│   └── manifest.json                   # PWA manifest

├── index.html                          # HTML entry point

├── DEVELOPMENT.md                      # Guida tecnica dettagliata + tabelle complete

└── README.md                           # Questo file

```



\---



\## 📊 Tabelle Implementate



\### DMG 2014 (Ch. 7, p. 136–144)

| Tabella | Fonte |

|---------|-------|

| Individual Treasure (4 fasce CR) | p. 136 |

| Treasure Hoard (4 fasce CR) | p. 137–138 |

| Gemstones (6 fasce di valore) | p. 134 |

| Art Objects (5 fasce di valore) | p. 134–135 |

| Magic Item Tables A–I | p. 144–149 |

| Figurine Subtable (d8) | p. 144 |

| Magic Armor Subtable (d12) | p. 144 |



\### DMG 2024 (Ch. 6–7, p. 120 + 326–330)

| Tabella | Fonte |

|---------|-------|

| Individual Treasure (4 fasce CR) | p. 120 |

| Treasure Hoard (4 fasce CR) | p. 120 |

| Arcana (Common → Legendary) | p. 326 |

| Armaments (Common → Legendary) | p. 328 |

| Implements (Common → Legendary) | p. 329 |

| Relics (Common → Legendary) | p. 330 |



\*\*Totale: 9 tabelle DMG 2014 + 20 tabelle DMG 2024 = 29 tabelle\*\*



> 📝 Per i dettagli completi di ogni riga di ogni tabella, vedi \[DEVELOPMENT.md](./DEVELOPMENT.md)



\---



\## 🛠️ Tech Stack



\- \*\*React 18\*\* — UI components

\- \*\*Vite\*\* — Build tool con \[vite-plugin-singlefile](https://github.com/nickreese/vite-plugin-singlefile) per output singolo file

\- \*\*Tailwind CSS v4\*\* — Utility-first styling

\- \*\*TypeScript\*\* — Type safety

\- \*\*localStorage\*\* — Persistenza preferenze e cronologia



\*\*Zero dipendenze runtime esterne.\*\* Tutto il codice è bundlato in un singolo `index.html` (\~460KB).



\---



\## 📱 PWA



L'app è installabile come PWA su mobile e desktop:

\- `manifest.json` con nome, icone, tema

\- Funziona offline dopo il primo caricamento (single-file)

\- Safe areas per iPhone (notch/Dynamic Island)

\- Standalone mode (senza barra browser)



\---



\## 🌐 Link Utili



\- ☕ \[Supporta la creatrice su Ko-fi](https://ko-fi.com/noemimarcolini)

\- ⚔️ \[Altri tool GDR e progetti](https://gdr-sys-portfolio2026.vercel.app/)



\---



\## 📋 Changelog



\### v1.0.5 (Attuale)

\- ✅ Tutte le 29 tabelle ufficiali implementate

\- ✅ 400+ oggetti magici con traduzioni EN/IT

\- ✅ CR raggruppati per fascia (0–4, 5–10, 11–16, 17+)

\- ✅ Totale valore per gemme e oggetti d'arte

\- ✅ Dark/Light/System theme

\- ✅ Lookup fuzzy per oggetti (case-insensitive, normalizzazione nomi)

\- ✅ Link Ko-fi e Portfolio

\- ✅ Bandiere accanto alla lingua

\- ✅ DEVELOPMENT.md con tutte le tabelle ufficiali complete



\### v1.0.0

\- Release iniziale con DMG 2014 e 2024



\---



\## 🤝 Contribuire



1\. Leggi \[DEVELOPMENT.md](./DEVELOPMENT.md) per capire l'architettura

2\. Per aggiungere un oggetto: modifica `src/data/magic-items-database.ts`

3\. Per aggiungere una lingua: modifica i file in `src/i18n/`

4\. Per aggiungere una tabella: modifica `src/data/tables2014.ts` o `tables2024.ts`



\---



\## 📜 Licenza



Progetto personale di \*\*Noemi Marcolini\*\*.



D\&D, Dungeons \& Dragons e tutti i nomi correlati sono marchi registrati di Wizards of the Coast LLC.

Questo tool è un progetto fan-made non affiliato con Wizards of the Coast.



\---



\*Sviluppato con ❤️ da \[Noemi Marcolini](https://ko-fi.com/noemimarcolini)\*



