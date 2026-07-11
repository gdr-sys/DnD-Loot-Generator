import { rollDice, rollPercent, rollDie } from './dice';
import {
  individualTreasure2024,
  treasureHoard2024,
  themes2024,
  magicItemTables2024,
} from '../data/tables2024';
import type { TreasureResult, MagicItemResult, CoinResult } from './generator2014';

function getCRTier(cr: string): string {
  const num = parseInt(cr);
  if (num <= 4) return '0-4';
  if (num <= 10) return '5-10';
  if (num <= 16) return '11-16';
  return '17+';
}

export function generateIndividual2024(cr: string): TreasureResult {
  const tier = getCRTier(cr);
  const entry = individualTreasure2024[tier];
  const coins: CoinResult[] = [];

  for (const coin of entry.coins) {
    coins.push({ type: coin.type, amount: rollDice(coin.dice) });
  }

  return {
    edition: '2024',
    type: 'individual',
    cr,
    coins,
    gems: [],
    art: [],
    magicItems: [],
    timestamp: Date.now(),
  };
}

function rollOnThemeTable(theme: string, rarity: string): MagicItemResult {
  const table = magicItemTables2024[theme]?.[rarity];
  if (!table) return { name: `Unknown (${theme}/${rarity})` };

  const roll = rollPercent();
  const row = table.find(r => roll >= r.min && roll <= r.max);

  if (!row) return { name: `${theme}/${rarity} (roll ${roll})` };

  return { name: row.item, table: `${theme} - ${rarity}`, roll };
}

export function generateHoard2024(cr: string): TreasureResult {
  const tier = getCRTier(cr);
  const hoard = treasureHoard2024[tier];

  // Roll GP
  const gpAmount = rollDice(hoard.gp);
  const coins: CoinResult[] = [{ type: 'gp', amount: gpAmount }];

  // Roll magic items
  const numItems = rollDice(hoard.magicItems);
  const magicItems: MagicItemResult[] = [];

  for (let i = 0; i < numItems; i++) {
    // Roll 1d2 for rarity (1 = first, 2 = second)
    const rarityIndex = rollDie(2) - 1;
    const rarity = hoard.rarities[rarityIndex];

    // Roll 1d4 for theme
    const themeIndex = rollDie(4) - 1;
    const theme = themes2024[themeIndex];

    magicItems.push(rollOnThemeTable(theme, rarity));
  }

  return {
    edition: '2024',
    type: 'hoard',
    cr,
    coins,
    gems: [],
    art: [],
    magicItems,
    timestamp: Date.now(),
  };
}

export function generateMagicItemByTheme(
  theme: string | 'random',
  rarity: string
): MagicItemResult {
  let actualTheme = theme;
  if (theme === 'random') {
    const themeIndex = rollDie(4) - 1;
    actualTheme = themes2024[themeIndex];
  }

  return rollOnThemeTable(actualTheme, rarity);
}
