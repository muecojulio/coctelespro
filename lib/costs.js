// Cálculo de costos, escalado por número de personas y lista de compras.
//
// Todos los precios base están en pesos mexicanos (MXN) y se pueden editar
// desde la pestaña "Costos"; lo editado se guarda en localStorage.

import { getIngredient } from './data/ingredients.js';
import { parseMeasure } from './i18n.js';

export const CURRENCIES = {
  MXN: { symbol: '$', label: 'Peso mexicano (MXN)', rate: 1 },
  USD: { symbol: '$', label: 'Dólar (USD)', rate: 0.055 },
  EUR: { symbol: '€', label: 'Euro (EUR)', rate: 0.05 },
};

// Presentaciones habituales para poder costear cerveza en lata, botella o caguama.
// El precio de cada tamaño se estima de forma proporcional al precio de referencia
// actual y puede ajustarse manualmente en la pestaña Costos.
export const BEER_PACK_OPTIONS = [
  { size: 250, label: 'Lata 250 ml' },
  { size: 330, label: 'Botella 330 ml' },
  { size: 355, label: 'Lata 355 ml' },
  { size: 473, label: 'Lata 473 ml' },
  { size: 710, label: 'Caguama 710 ml' },
];

export function formatMoney(value, currency = 'MXN') {
  const config = CURRENCIES[currency] || CURRENCIES.MXN;
  const amount = Number(value || 0) * config.rate;
  const decimals = amount > 0 && amount < 100 ? 2 : amount < 1000 ? 2 : 0;
  const formatted = amount.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${config.symbol}${formatted}`;
}

// ── Presentaciones y precios ───────────────────────────────────────────────

export function packOf(key, prices = {}) {
  const info = getIngredient(key);
  const override = prices?.[info.key];
  const pack = { ...info.pack };
  if (override) {
    if (Number(override.size) > 0) pack.size = Number(override.size);
    if (Number(override.price) >= 0) pack.price = Number(override.price);
    if (override.label) pack.label = override.label;
  }
  return { ...pack, base: info.base, category: info.cat, name: info.es };
}

export function priceIsEdited(key, prices = {}) {
  const info = getIngredient(key);
  return Boolean(prices?.[info.key]);
}

// ── Medidas ────────────────────────────────────────────────────────────────

const UNIT_TO_BASE = {
  taza: { factor: 240, base: 'ml' },
  cucharada: { factor: 15, base: 'ml' },
  cucharadita: { factor: 5, base: 'ml' },
  caballito: { factor: 44, base: 'ml' },
  lata: { factor: 355, base: 'ml' },
  botella: { factor: 750, base: 'ml' },
  vaso: { factor: 250, base: 'ml' },
  chorrito: { factor: 10, base: 'ml' },
  bola: { factor: 60, base: 'ml' },
  galón: { factor: 3785, base: 'ml' },
  cuarto: { factor: 946, base: 'ml' },
  pinta: { factor: 473, base: 'ml' },
};

const COUNT_UNITS = new Set([
  'pieza', 'rodaja', 'gajo', 'cubo', 'rama', 'hoja', 'cáscara', 'parte',
  'porción', 'manojo', 'unidad', 'raja', 'bolsita',
]);

const SEASONING_UNITS = new Set(['pizca', 'gotas', 'dash']);

// Convierte una medida legible ("1 1/2 oz", "2 pizcas", "3 rodajas") en
// una cantidad comparable: volumen en ml, peso en g o número de piezas.
export function parseAmount(measure) {
  const parsed = parseMeasure(measure);
  const quantity = Number(parsed.quantity) || 1;
  const unit = parsed.unit;

  if (['ml', 'cl', 'oz', 'l'].includes(unit)) {
    const ml = unit === 'ml' ? quantity
      : unit === 'cl' ? quantity * 10
        : unit === 'l' ? quantity * 1000
          : quantity * 29.5735;
    return { kind: 'volume', quantity: Math.round(ml * 10) / 10, unit: 'ml', label: `${formatVolume(Math.round(ml * 10) / 10)}` };
  }
  if (unit === 'g') return { kind: 'weight', quantity, unit: 'g', label: `${Math.round(quantity)} g` };
  if (SEASONING_UNITS.has(unit)) {
    return { kind: 'seasoning', quantity, unit: 'porción', label: parsed.text };
  }
  const conversion = UNIT_TO_BASE[unit];
  if (conversion) {
    return { kind: 'volume', quantity: quantity * conversion.factor, unit: 'ml', label: parsed.text, display: parsed.text };
  }
  if (COUNT_UNITS.has(unit)) {
    return { kind: 'count', quantity, unit: 'pieza', label: parsed.text, display: parsed.text };
  }
  return { kind: 'seasoning', quantity, unit: 'porción', label: parsed.text || 'Al gusto' };
}

export function formatVolume(ml) {
  const value = Number(ml) || 0;
  if (value >= 1000) {
    const liters = Math.round((value / 1000) * 100) / 100;
    return `${String(liters).replace('.', ',')} L`;
  }
  if (value < 1) return `${Math.round(value * 1000)} ml`;
  return `${Math.round(value * 10) / 10} ml`;
}

export function scaleMeasureLabel(amount, factor) {
  if (factor === 1) return amount.label;
  if (amount.kind === 'volume') return formatVolume(amount.quantity * factor);
  if (amount.kind === 'weight') return `${Math.round(amount.quantity * factor)} g`;
  if (amount.kind === 'count') {
    const total = Math.round(amount.quantity * factor * 10) / 10;
    return `${String(total).replace('.', ',')} ${total === 1 ? 'pieza' : 'piezas'}`;
  }
  return `${String(Math.round(amount.quantity * factor * 10) / 10).replace('.', ',')} × ${amount.label}`;
}

// ── Costos ─────────────────────────────────────────────────────────────────

export function ingredientCost(key, measure, prices = {}, multiplier = 1) {
  const pack = packOf(key, prices);
  const amount = parseAmount(measure);
  if (!pack.size || pack.price == null) return { cost: 0, pack, amount };
  const unitCost = pack.price / pack.size;

  if (amount.kind === 'volume') {
    const qty = pack.base === 'g' ? amount.quantity : amount.quantity; // ml ≈ g para bebidas
    return { cost: (qty * multiplier * unitCost), pack, amount };
  }
  if (amount.kind === 'weight') {
    return { cost: (amount.quantity * multiplier * unitCost), pack, amount };
  }
  if (amount.kind === 'count') {
    if (pack.base === 'pieza') return { cost: (amount.quantity * multiplier * unitCost), pack, amount };
    // Adornos (rodajas, ramas, cáscaras) sobre insumos que se venden por ml o g.
    return { cost: (0.03 * pack.price * amount.quantity * multiplier), pack, amount, estimated: true };
  }
  return { cost: 0.02 * pack.price * amount.quantity * multiplier, pack, amount, estimated: true };
}

export function recipeCost(drink, prices = {}, multiplier = 1) {
  if (!drink) return { lines: [], total: 0, perDrink: 0 };
  const lines = drink.ingredients.map((ingredient) => {
    const result = ingredientCost(ingredient.key, ingredient.measure, prices, multiplier);
    return {
      key: ingredient.key,
      name: ingredient.name,
      measure: ingredient.measure,
      scaledLabel: scaleMeasureLabel(result.amount, multiplier),
      amount: result.amount,
      pack: result.pack,
      estimated: Boolean(result.estimated || getIngredient(ingredient.key).estimated),
      costPerDrink: multiplier ? result.cost / multiplier : result.cost,
      cost: result.cost,
    };
  });
  const total = lines.reduce((sum, line) => sum + line.cost, 0);
  return { lines, total, perDrink: multiplier ? total / multiplier : total };
}

export function packUsage(total, pack) {
  if (!pack?.size || !(Number(total) > 0)) return null;
  const packs = Number(total) / Number(pack.size);
  const requiredPacks = Math.ceil(packs - 1e-9);
  return {
    packs,
    roundedPacks: requiredPacks,
    requiredPacks,
    purchaseCost: requiredPacks * (Number(pack.price) || 0),
    label: pack.label,
  };
}

function amountLabel(kind, total) {
  if (kind === 'volume') return formatVolume(total);
  if (kind === 'weight') return `${Math.round(total)} g`;
  if (kind === 'seasoning') return `${Math.round(total * 10) / 10} porciones al gusto`;
  return `${Math.round(total * 10) / 10} piezas`;
}

function shoppingForRecipe(lines, drinks) {
  return lines.map((line) => {
    const total = line.amount.quantity * drinks;
    const packs = line.amount.kind === 'seasoning' ? null : packUsage(total, line.pack);
    return {
      key: line.key,
      name: line.name,
      pack: line.pack,
      total,
      cost: line.cost,
      kind: line.amount.kind,
      amountLabel: amountLabel(line.amount.kind, total),
      packs,
      estimated: line.estimated,
    };
  });
}

// ── Plan de fiesta y lista de compras ──────────────────────────────────────

// `menu`: [{ drink, perPerson }] — vasos por persona de cada cóctel.
export function partyPlan(menu, people, prices = {}) {
  const guestCount = Math.max(1, Number(people) || 1);
  const items = [];
  const aggregate = new Map();
  let drinksTotal = 0;

  menu.forEach((entry) => {
    if (!entry?.drink) return;
    const perPerson = Math.max(1, Number(entry.perPerson) || 1);
    const drinks = perPerson * guestCount;
    drinksTotal += drinks;
    const cost = recipeCost(entry.drink, prices, drinks);
    items.push({
      drink: entry.drink,
      perPerson,
      drinks,
      cost: cost.total,
      costPerDrink: cost.perDrink,
      lines: cost.lines,
      shopping: shoppingForRecipe(cost.lines, drinks),
    });

    cost.lines.forEach((line) => {
      const existing = aggregate.get(line.key) || {
        key: line.key,
        name: line.name,
        pack: line.pack,
        total: 0,
        cost: 0,
        kind: line.amount.kind,
        usedBy: new Set(),
      };
      existing.total += line.amount.quantity * drinks;
      existing.cost += line.cost;
      existing.usedBy.add(entry.drink.name);
      aggregate.set(line.key, existing);
    });
  });

  const shopping = Array.from(aggregate.values())
    .map((item) => {
      const usage = item.kind === 'seasoning' ? null : packUsage(item.total, item.pack);
      return {
        ...item,
        usedBy: Array.from(item.usedBy),
        amountLabel: amountLabel(item.kind, item.total),
        packs: usage,
      };
    })
    .sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name, 'es'));

  const total = items.reduce((sum, item) => sum + item.cost, 0);
  return {
    items,
    shopping,
    drinksTotal,
    total,
    perPerson: total / guestCount,
    perDrink: drinksTotal ? total / drinksTotal : 0,
    people: guestCount,
    iceKg: Math.max(1, Math.ceil((drinksTotal * 0.35) * 10) / 10),
  };
}

export function suggestedPrice(costPerDrink, marginPercent = 70) {
  const margin = Math.max(0, Number(marginPercent) || 0);
  const price = costPerDrink * (1 + margin / 100);
  return { price, profit: price - costPerDrink };
}

// Aplica el mismo recargo de venta a cada receta, para que ingreso y ganancia
// se puedan consultar tanto por cóctel como para el menú completo.
export function partySales(plan, marginPercent = 70) {
  const items = (plan?.items || []).map((item) => {
    const sale = suggestedPrice(item.costPerDrink, marginPercent);
    const revenue = sale.price * item.drinks;
    const profit = revenue - item.cost;
    return { ...item, salePrice: sale.price, revenue, profit };
  });
  const revenue = items.reduce((sum, item) => sum + item.revenue, 0);
  const cost = Number(plan?.total) || 0;
  return {
    ...plan,
    items,
    revenue,
    profit: revenue - cost,
    marginPercent: Math.max(0, Number(marginPercent) || 0),
  };
}
