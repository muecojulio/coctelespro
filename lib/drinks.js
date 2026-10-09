// Construye el modelo de bebida que usa la interfaz.
// Une el catálogo local (ya en español) con el catálogo internacional
// (TheCocktailDB), que se traduce automáticamente al español.

import { LOCAL_RECIPES } from './data/recipes-local.js';
import { getIngredient } from './data/ingredients.js';
import {
  normalizeText,
  translateAlcoholic,
  translateCategory,
  translateGlass,
  translateIngredientName,
  translateInstructions,
  translateTags,
} from './i18n.js';

const EMOJI_BY_TYPE = {
  coctel: '🍸',
  cerveza: '🍺',
  shot: '🥃',
  vino: '🍷',
  caliente: '☕',
  'sin-alcohol': '🥤',
};

const EMOJI_BY_KEYWORD = [
  [/piña colada|colada|tropical|hurac|hawai|caribe/i, '🍹'],
  [/cerveza|michelada|chelada|cheve|shandy|radler|stout|pinta/i, '🍺'],
  [/café|cafe|espresso|irlandés|carajillo|atole|chocolate/i, '☕'],
  [/vino|sangría|sangria|mimosa|bellini|spritz|champaña|prosecco|tinto/i, '🍷'],
  [/caballito|shot|chupito|b-?52|kamikaze/i, '🥃'],
  [/sin alcohol|limonada|horchata|jamaica|naranjada|licuado|té helado|tepache/i, '🥤'],
  [/margarita|daiquiri|martini|cosmopolit/i, '🍸'],
];

export function drinkEmoji(name, type, tags = []) {
  const haystack = `${name} ${(tags || []).join(' ')}`;
  for (const [pattern, emoji] of EMOJI_BY_KEYWORD) {
    if (pattern.test(haystack)) return emoji;
  }
  return EMOJI_BY_TYPE[type] || '🍸';
}

function buildIngredient(key, measure, fallbackName) {
  const info = getIngredient(key);
  const name = info.estimated && fallbackName ? translateIngredientName(fallbackName) : info.es;
  return {
    key,
    name: name || translateIngredientName(key),
    measure: String(measure || '').trim() || 'Al gusto',
    category: info.cat,
    estimated: Boolean(info.estimated),
  };
}

export function localRecipeToDrink(recipe) {
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  return {
    id: recipe.id,
    idDrink: recipe.id,
    name: recipe.name,
    strDrink: recipe.name,
    nameEn: recipe.nameEn || recipe.name,
    source: 'local',
    type: recipe.type,
    category: recipe.category,
    glass: recipe.glass,
    alcoholic: recipe.type === 'sin-alcohol' ? 'Sin alcohol' : 'Con alcohol',
    tags,
    instructions: recipe.instructions,
    instructionsAutomatic: false,
    emoji: drinkEmoji(recipe.name, recipe.type, tags),
    ingredients: recipe.ingredients.map(([key, measure]) => buildIngredient(key, measure)),
  };
}

export function remoteDrinkToDrink(drink) {
  const ingredients = [];
  for (let index = 1; index <= 15; index += 1) {
    const key = drink[`strIngredient${index}`];
    if (!key || !String(key).trim()) continue;
    ingredients.push(buildIngredient(String(key).trim(), drink[`strMeasure${index}`], String(key).trim()));
  }
  const rawInstructions = String(drink.strInstructions || '').trim();
  const localized = translateInstructions(rawInstructions);
  const instructionInfo = typeof localized === 'string'
    ? { text: localized, automatic: false }
    : localized;
  const category = translateCategory(drink.strCategory);
  const alcoholic = translateAlcoholic(drink.strAlcoholic);
  const type = /sin alcohol|non/i.test(alcoholic) ? 'sin-alcohol'
    : /caballito|shot/i.test(category) ? 'shot'
      : /cerveza|beer/i.test(category) ? 'cerveza'
        : /vino|wine|espumoso|champ/i.test(category) ? 'vino'
          : /café|té|caliente|coffee/i.test(category) ? 'caliente'
            : 'coctel';
  const tags = translateTags(drink.strTags);
  const nameEn = String(drink.strDrink || '').trim();
  const name = translateIngredientName(nameEn);
  const alcoholicTag = /sin alcohol/i.test(alcoholic) ? 'Sin alcohol' : 'Con alcohol';
  const allTags = Array.from(new Set([...tags, alcoholicTag].filter(Boolean)));

  return {
    id: `online-${drink.idDrink}`,
    idDrink: `online-${drink.idDrink}`,
    remoteId: String(drink.idDrink || ''),
    name,
    strDrink: name,
    nameEn,
    source: 'internet',
    type,
    category,
    glass: translateGlass(drink.strGlass),
    alcoholic,
    tags: allTags,
    instructions: instructionInfo.text,
    instructionsAutomatic: Boolean(instructionInfo.automatic),
    emoji: drinkEmoji(`${name} ${nameEn}`, type, allTags),
    ingredients,
  };
}

export const LOCAL_DRINKS = LOCAL_RECIPES.map(localRecipeToDrink);

export function mergeDrinks(...lists) {
  const unique = new Map();
  lists.flat().forEach((drink) => {
    if (!drink || !drink.id) return;
    if (!unique.has(drink.id)) unique.set(drink.id, drink);
  });
  return Array.from(unique.values());
}

export function allCategories(drinks) {
  const values = new Set();
  drinks.forEach((drink) => {
    if (drink.category) values.add(drink.category);
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'es'));
}

export function searchDrinks(drinks, query) {
  const term = normalizeText(query);
  if (!term) return drinks;
  const terms = term.split(' ').filter(Boolean);
  const scored = drinks.map((drink) => {
    const name = normalizeText(drink.name);
    const nameEn = normalizeText(drink.nameEn);
    const extras = normalizeText([drink.category, drink.glass, ...(drink.tags || [])].join(' '));
    const ingredients = normalizeText(drink.ingredients.map((item) => item.name).join(' '));
    let score = 0;
    terms.forEach((word) => {
      if (name.startsWith(word)) score += 6;
      else if (name.includes(word)) score += 4;
      if (nameEn.includes(word)) score += 3;
      if (ingredients.includes(word)) score += 2;
      if (extras.includes(word)) score += 1;
    });
    return { drink, score };
  });
  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.drink.name.localeCompare(b.drink.name, 'es'))
    .map((entry) => entry.drink);
}


