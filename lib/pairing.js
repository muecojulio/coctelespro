// Motor de coincidencias entre "Mis ingredientes" y las bebidas del catálogo.

import { getIngredient } from './data/ingredients.js';
import { normalizeText } from './i18n.js';

const STAPLE_KEYS = ['Ice', 'Water'];

const GENERIC_WORDS = new Set([
  'jugo', 'licor', 'salsa', 'jarabe', 'refresco', 'vino', 'cerveza', 'agua',
  'hielo', 'crema', 'leche', 'te', 'cafe', 'sal', 'azucar',
]);

const EXTRA_ALIASES = {
  cheve: 'cerveza',
  chela: 'cerveza',
  birra: 'cerveza',
  coca: 'refresco de cola',
  cocal: 'refresco de cola',
  squirt: 'refresco de toronja',
  toronja: 'refresco de toronja',
  limon: 'jugo de limon',
  limones: 'jugo de limon',
  lima: 'limon verde',
  hierbabuena: 'menta',
  yerbabuena: 'menta',
  tequila: 'tequila',
  mezcal: 'mezcal',
  ron: 'ron',
  vodka: 'vodka',
  ginebra: 'ginebra',
  gin: 'ginebra',
  wiski: 'whisky',
  gueisqui: 'whisky',
  hielos: 'hielo',
  hielo: 'hielo',
  agua: 'agua',
  azucar: 'azucar',
  sal: 'sal',
};

function singularCandidates(word) {
  const value = String(word || '');
  const out = new Set([value]);
  if (value.length > 3 && value.endsWith('s')) out.add(value.slice(0, -1));
  if (value.length > 4 && value.endsWith('es')) out.add(value.slice(0, -2));
  return Array.from(out).filter(Boolean);
}

function tokens(text) {
  return normalizeText(text).split(' ').filter(Boolean);
}

function targetNames(ingredient) {
  const info = getIngredient(ingredient.key);
  const aliases = Array.isArray(info.aliases) ? info.aliases : [];
  return [ingredient.name, ingredient.key, info.es, ...aliases]
    .filter(Boolean)
    .map((value) => normalizeText(value));
}

// Compara un ingrediente del usuario con un ingrediente de la receta.
// Devuelve 0 cuando no hay coincidencia y hasta 1 cuando es exacta.
export function ingredientMatchScore(term, ingredient) {
  const cleanTerm = normalizeText(EXTRA_ALIASES[normalizeText(term)] || term);
  if (!cleanTerm) return 0;
  const termWords = singularCandidates(cleanTerm).flatMap((value) => value.split(' ')).filter(Boolean);
  const names = targetNames(ingredient);

  for (const name of names) {
    if (name === cleanTerm) return 1;
    const nameWords = name.replace(/^de |^del /, '').split(' ').filter(Boolean);
    const nameSingular = nameWords.map((word) => singularCandidates(word)[0]);
    const isGeneric = termWords.length === 1 && GENERIC_WORDS.has(termWords[0]);
    if (isGeneric) {
      if (nameWords[0] === termWords[0] || nameSingular[0] === termWords[0]) return 0.9;
      continue;
    }
    if (cleanTerm.length >= 4 && name.includes(cleanTerm)) return 0.92;
    const everyWordMatches = termWords.every((word) => nameWords.includes(word) || nameSingular.includes(word));
    if (everyWordMatches && termWords.length > 1) return 0.86;
    const nameWordMatches = nameWords.some((word) => termWords.includes(word) && word.length >= 4);
    if (nameWordMatches && termWords.length === 1 && nameWords.length <= 2) return 0.8;
  }
  return 0;
}

export function pantryEntries(mine) {
  return (Array.isArray(mine) ? mine : [])
    .map((item) => (typeof item === 'string' ? item : item?.raw ?? item?.name ?? ''))
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((raw) => ({ raw, norm: normalizeText(raw) }));
}

export function matchDrink(drink, pantry, options = {}) {
  const includeStaples = options.includeStaples !== false;
  const entries = pantryEntries(pantry);
  const have = [];
  const missing = [];
  const basics = [];

  drink.ingredients.forEach((ingredient) => {
    if (includeStaples && STAPLE_KEYS.includes(ingredient.key)) {
      basics.push(ingredient);
      return;
    }
    let best = 0;
    let matchedTerm = '';
    entries.forEach((entry) => {
      const score = ingredientMatchScore(entry.raw, ingredient);
      if (score > best) {
        best = score;
        matchedTerm = entry.raw;
      }
    });
    if (best > 0) have.push({ ingredient, term: matchedTerm, score: best });
    else missing.push({ ingredient });
  });

  const total = drink.ingredients.length || 1;
  const coverage = (have.length + basics.length) / total;
  return {
    drink,
    have,
    missing,
    basics,
    coverage,
    canMake: missing.length === 0,
    almost: missing.length <= 2,
  };
}

export function rankDrinks(drinks, pantry, options = {}) {
  const entries = pantryEntries(pantry);
  if (!entries.length) return [];
  return drinks
    .map((drink) => matchDrink(drink, entries, options))
    .filter((result) => result.have.length > 0 || result.canMake)
    .sort((a, b) => {
      if (a.canMake !== b.canMake) return a.canMake ? -1 : 1;
      if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
      if (b.coverage !== a.coverage) return b.coverage - a.coverage;
      return a.drink.name.localeCompare(b.drink.name, 'es');
    });
}

// Insumos que, al añadirlos, desbloquearían más bebidas.
export function unlockSuggestions(ranked, limit = 3) {
  const counter = new Map();
  ranked.forEach((result) => {
    if (result.canMake) return;
    const seen = new Set();
    result.missing.forEach(({ ingredient }) => {
      if (seen.has(ingredient.key)) return;
      seen.add(ingredient.key);
      const entry = counter.get(ingredient.key) || { ingredient, count: 0 };
      entry.count += 1;
      counter.set(ingredient.key, entry);
    });
  });
  return Array.from(counter.values())
    .sort((a, b) => b.count - a.count || a.ingredient.name.localeCompare(b.ingredient.name, 'es'))
    .slice(0, limit);
}

export { EXTRA_ALIASES, STAPLE_KEYS };
