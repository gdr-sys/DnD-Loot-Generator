import { rollDice, rollPercent, pick, rollDie } from './dice';
import {
  individualTreasure2014,
  hoardBaseCoins2014,
  treasureHoard2014,
  gemstones2014,
  artObjects2014,
  magicItemTables2014,
  figurineSubtable2014,
  magicArmorSubtable2014,
} from '../data/tables2014';

export interface CoinResult {
  type: string;
  amount: number;
}

export interface GemResult {
  name: string;
  value: number;
}

export interface ArtResult {
  name: string;
  value: number;
}

export interface MagicItemResult {
  name: string;
  table?: string;
  roll?: number;
}

export interface TreasureResult {
  edition: '2014' | '2024';
  type: 'individual' | 'hoard';
  cr: string;
  coins: CoinResult[];
  gems: GemResult[];
  art: ArtResult[];
  magicItems: MagicItemResult[];
  timestamp: number;
}

function getCRTier(cr: string): string {
  const num = parseInt(cr);
  if (num <= 4) return '0-4';
  if (num <= 10) return '5-10';
  if (num <= 16) return '11-16';
  return '17+';
}

export function generateIndividual2014(cr: string): TreasureResult {
  const tier = getCRTier(cr);
  const table = individualTreasure2014[tier];
  const roll = rollPercent();

  const row = table.find(r => roll >= r.min && roll <= r.max);
  const coins: CoinResult[] = [];

  if (row) {
    for (const coin of row.coins) {
      coins.push({ type: coin.type, amount: rollDice(coin.dice) });
    }
  }

  return {
    edition: '2014',
    type: 'individual',
    cr,
    coins,
    gems: [],
    art: [],
    magicItems: [],
    timestamp: Date.now(),
  };
}

function rollMagicItem(tableLetter: string): MagicItemResult {
  const table = magicItemTables2014[tableLetter];
  if (!table) return { name: `Unknown Table ${tableLetter}`, table: tableLetter };

  const roll = rollPercent();
  const row = table.find(r => roll >= r.min && roll <= r.max);

  if (!row) return { name: `Table ${tableLetter} (roll ${roll})`, table: tableLetter, roll };

  let itemName = row.item;

  // Handle subtables
  if (itemName === 'Figurine of wondrous power (roll d8)') {
    const subRoll = rollDie(8);
    itemName = figurineSubtable2014[subRoll - 1];
  } else if (itemName === 'Roll on Magic Armor table (d12)') {
    const subRoll = rollDie(12);
    itemName = magicArmorSubtable2014[subRoll - 1];
  }

  return { name: itemName, table: tableLetter, roll };
}

export function generateHoard2014(cr: string): TreasureResult {
  const tier = getCRTier(cr);

  // Roll base coins
  const baseCoins = hoardBaseCoins2014[tier];
  const coins: CoinResult[] = [];
  for (const coin of baseCoins.coins) {
    coins.push({ type: coin.type, amount: rollDice(coin.dice) });
  }

  // Roll on hoard table
  const hoardTable = treasureHoard2014[tier];
  const roll = rollPercent();
  const row = hoardTable.find(r => roll >= r.min && roll <= r.max);

  const gems: GemResult[] = [];
  const art: ArtResult[] = [];
  const magicItems: MagicItemResult[] = [];

  if (row) {
    // Gems
    if (row.gems) {
      const count = rollDice(row.gems.dice);
      const gemList = gemstones2014[row.gems.value] || [];
      for (let i = 0; i < count; i++) {
        gems.push({ name: pick(gemList), value: row.gems.value });
      }
    }

    // Art
    if (row.art) {
      const count = rollDice(row.art.dice);
      const artList = artObjects2014[row.art.value] || [];
      for (let i = 0; i < count; i++) {
        art.push({ name: pick(artList), value: row.art.value });
      }
    }

    // Magic Items
    if (row.magicItems) {
      const count = rollDice(row.magicItems.dice);
      for (let i = 0; i < count; i++) {
        magicItems.push(rollMagicItem(row.magicItems.table));
      }
    }
  }

  return {
    edition: '2014',
    type: 'hoard',
    cr,
    coins,
    gems,
    art,
    magicItems,
    timestamp: Date.now(),
  };
}
