// Dice rolling utilities

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollPercent(): number {
  return rollDie(100);
}

export function rollDice(expr: string): number {
  // Parse expressions like "3d6", "2d8*10", "1d4-1", "2d6*100", "1d6*1000"
  const trimmed = expr.trim();

  // Check for multiplication: e.g. "2d6*100"
  const mulMatch = trimmed.match(/^(\d+)d(\d+)\*(\d+)$/i);
  if (mulMatch) {
    const [, count, sides, multiplier] = mulMatch;
    let total = 0;
    for (let i = 0; i < parseInt(count); i++) {
      total += rollDie(parseInt(sides));
    }
    return total * parseInt(multiplier);
  }

  // Check for addition: e.g. "1d4+1"
  const addMatch = trimmed.match(/^(\d+)d(\d+)\+(\d+)$/i);
  if (addMatch) {
    const [, count, sides, bonus] = addMatch;
    let total = 0;
    for (let i = 0; i < parseInt(count); i++) {
      total += rollDie(parseInt(sides));
    }
    return total + parseInt(bonus);
  }

  // Check for subtraction: e.g. "1d4-1"
  const subMatch = trimmed.match(/^(\d+)d(\d+)-(\d+)$/i);
  if (subMatch) {
    const [, count, sides, penalty] = subMatch;
    let total = 0;
    for (let i = 0; i < parseInt(count); i++) {
      total += rollDie(parseInt(sides));
    }
    return Math.max(0, total - parseInt(penalty));
  }

  // Simple: e.g. "3d6"
  const simpleMatch = trimmed.match(/^(\d+)d(\d+)$/i);
  if (simpleMatch) {
    const [, count, sides] = simpleMatch;
    let total = 0;
    for (let i = 0; i < parseInt(count); i++) {
      total += rollDie(parseInt(sides));
    }
    return total;
  }

  // Plain number
  const num = parseInt(trimmed);
  if (!isNaN(num)) return num;

  return 0;
}

export function rollWithModifier(dice: string, modifier: number, min: number): number {
  const result = rollDice(dice) + modifier;
  return Math.max(min, result);
}

export function pick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
