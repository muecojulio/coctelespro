// Traducción y formato en español para todo lo que llega del catálogo
// internacional (TheCocktailDB) y para las medidas de las recetas locales.

import { INGREDIENTS } from './data/ingredients.js';

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}

const ALCOHOL_LABELS = {
  alcoholic: 'Con alcohol',
  'non alcoholic': 'Sin alcohol',
  'non-alcoholic': 'Sin alcohol',
  optional: 'Opcional con alcohol',
  'optional alcohol': 'Opcional con alcohol',
};

const CATEGORY_LABELS = {
  cocktail: 'Cóctel',
  'ordinary drink': 'Bebida de bar',
  shot: 'Caballito',
  'shot / shooter': 'Caballito',
  'coffee / tea': 'Café o té',
  'homemade liqueur': 'Licor casero',
  punch: 'Ponche',
  'punch / party drink': 'Ponche de fiesta',
  'party drink': 'Bebida de fiesta',
  beer: 'Cerveza',
  'soft drink': 'Refresco',
  'soft drink / soda': 'Refresco',
  'hot drink': 'Bebida caliente',
  shake: 'Malteada',
  'milk / float / shake': 'Leche, malteada o flotado',
  'other / unknown': 'Otra',
  other: 'Otra',
};

const GLASS_LABELS = {
  'highball glass': 'Vaso alto',
  'cocktail glass': 'Copa de cóctel',
  'martini glass': 'Copa martini',
  'margarita glass': 'Copa margarita',
  'old-fashioned glass': 'Vaso old fashioned',
  'collins glass': 'Vaso collins',
  'pint glass': 'Vaso de pinta',
  'beer mug': 'Tarrito cervecero',
  'beer glass': 'Vaso cervecero',
  'beer pilsner': 'Vaso pilsner',
  'shot glass': 'Vaso de chupito',
  'whiskey sour glass': 'Copa whisky sour',
  'white wine glass': 'Copa de vino blanco',
  'wine glass': 'Copa de vino',
  'champagne flute': 'Copa flauta',
  'hurricane glass': 'Vaso huracán',
  'irish coffee cup': 'Taza irlandesa',
  'coffee mug': 'Taza',
  mug: 'Tarro',
  cup: 'Taza',
  'copper mug': 'Tarrito de cobre',
  'mason jar': 'Frasco de vidrio',
  jar: 'Frasco',
  pitcher: 'Jarra',
  'punch bowl': 'Ponchera',
  "nick and nora glass": 'Copa Nick and Nora',
  'balloon glass': 'Copa balón',
  'cordial glass': 'Vaso cordial',
  'coupe glass': 'Copa coupe',
  'parfait glass': 'Copa parfait',
  'pousse cafe glass': 'Copa pousse café',
  'brandy snifter': 'Copa de brandy',
  'port glass': 'Copa de oporto',
  'sherry glass': 'Copa de jerez',
  'wine cooler': 'Vaso de vino grande',
  'clear glass': 'Vaso transparente',
};

const TAG_LABELS = {
  alcoholic: 'Con alcohol',
  'non-alcoholic': 'Sin alcohol',
  'dinner party': 'Cena con invitados',
  'hangover cure': 'Para después de la fiesta',
  'new year': 'Año Nuevo',
  'valentine': 'San Valentín',
  'st. patrick': 'San Patricio',
  'holiday': 'Fiesta',
  'brunch': 'Brunch',
  'summer': 'Verano',
  'winter': 'Invierno',
  'christmas': 'Navidad',
  'halloween': 'Halloween',
  'thanksgiving': 'Acción de gracias',
  'apéritif': 'Aperitivo',
  'aperitif': 'Aperitivo',
  'digestif': 'Digestivo',
  'nightcap': 'Para terminar la noche',
  'tropical': 'Tropical',
  'refreshing': 'Refrescante',
  'strong': 'Fuerte',
  'sweet': 'Dulce',
  'sour': 'Ácido',
  'bitter': 'Amargo',
  'fruity': 'Frutal',
  'creamy': 'Cremoso',
  'hot': 'Caliente',
  'iced': 'Helado',
  'party': 'Fiesta',
  'punch': 'Ponche',
  'shake': 'Malteada',
  'beer': 'Cerveza',
  'spirit': 'Destilado',
  'liqueur': 'Licor',
  'wine': 'Vino',
  'coffee': 'Café',
  'tea': 'Té',
  'breakfast': 'Desayuno',
  'dessert': 'Postre',
  'fruit': 'Fruta',
  'mexican': 'Mexicano',
  'mexico': 'México',
  'classic': 'Clásico',
  'tiki': 'Tiki',
  'fizzy': 'Con gas',
};

function lookupLabel(map, value, fallback) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  const label = map[raw.toLocaleLowerCase('es')];
  return label || raw;
}

export function translateAlcoholic(value) {
  return lookupLabel(ALCOHOL_LABELS, value, value ? String(value) : 'Con alcohol');
}

export function translateCategory(value) {
  return lookupLabel(CATEGORY_LABELS, value, value ? String(value) : 'Cóctel');
}

export function translateGlass(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Vaso para servir';
  const label = GLASS_LABELS[raw.toLocaleLowerCase('es')];
  if (label) return label;
  return raw
    .replace(/glass/gi, 'vaso')
    .replace(/mug/gi, 'tarro')
    .replace(/cup/gi, 'taza')
    .replace(/bowl/gi, 'ponchera')
    .replace(/flute/gi, 'copa flauta');
}

export function translateTag(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return TAG_LABELS[raw.toLocaleLowerCase('es')] || raw;
}

export function translateTags(value) {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : String(value).split(',');
  return parts
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map(translateTag)
    .filter(Boolean);
}

// ── Medidas ────────────────────────────────────────────────────────────────

const UNIT_LABELS = [
  // Medidas en español.
  [/^cucharaditas?\b|^cditas?\b/, 'cucharadita'],
  [/^cucharadas?\b|^cdas?\b/, 'cucharada'],
  [/^tazas?\b/, 'taza'],
  [/^pizcas?\b/, 'pizca'],
  [/^gotitas?\b|^gotas?\b/, 'gotas'],
  [/^chorritos?\b/, 'chorrito'],
  [/^rodajas?\b/, 'rodaja'],
  [/^gajos?\b/, 'gajo'],
  [/^cubos?\b|^hielos?\b/, 'cubo'],
  [/^ramitas?\b|^ramas?\b/, 'rama'],
  [/^hojas?\b/, 'hoja'],
  [/^rajas?\b|^varitas?\b/, 'raja'],
  [/^manojos?\b/, 'manojo'],
  [/^cáscaras?\b|^cascaras?\b/, 'cáscara'],
  [/^piezas?\b/, 'pieza'],
  [/^bolsitas?\b|^sobres?\b/, 'bolsita'],
  [/^latas?\b/, 'lata'],
  [/^botellas?\b/, 'botella'],
  [/^vasos?\b/, 'vaso'],
  [/^caballitos?\b|^shots?\b/, 'caballito'],
  [/^porciones?\b/, 'porción'],
  [/^partes?\b/, 'parte'],
  [/^al gusto\b|^a gusto\b/, 'porción'],
  [/^gramos?\b|^grs?\b/, 'g'],
  // Medidas en inglés.
  [/^ounces?\b|^oz\b/, 'oz'],
  [/^centiliters?\b|^cl\b/, 'cl'],
  [/^milliliters?\b|^ml\b/, 'ml'],
  [/^liters?\b|^litres?\b|^lts?\b|^l\b/, 'l'],
  [/^tablespoons?\b|^tbsps?\b|^tblsps?\b|^tbls?\b|^tbs\b/, 'cucharada'],
  [/^teaspoons?\b|^tsps?\b/, 'cucharadita'],
  [/^cups?\b/, 'taza'],
  [/^pints?\b/, 'pinta'],
  [/^quarts?\b|^qts?\b/, 'cuarto'],
  [/^gallons?\b|^gals?\b/, 'galón'],
  [/^dashes?\b|^dash\b/, 'gotas'],
  [/^drops?\b/, 'gotas'],
  [/^pinch(?:es)?\b/, 'pizca'],
  [/^splashes?\b/, 'chorrito'],
  [/^twists?\b/, 'cáscara'],
  [/^slices?\b/, 'rodaja'],
  [/^wedges?\b/, 'gajo'],
  [/^cubes?\b/, 'cubo'],
  [/^sprigs?\b/, 'rama'],
  [/^leaves\b|^leaf\b/, 'hoja'],
  [/^shots?\b|^jiggers?\b|^ponies?\b|^pony\b/, 'caballito'],
  [/^parts?\b|^measures?\b/, 'parte'],
  [/^cans?\b/, 'lata'],
  [/^bottles?\b|^fifths?\b/, 'botella'],
  [/^glasses\b|^glass\b/, 'vaso'],
  [/^scoops?\b/, 'bola'],
  [/^dollops?\b/, 'porción'],
  [/^grams?\b|^grs?\b|^g\b/, 'g'],
  [/^pieces?\b|^wholes?\b/, 'pieza'],
  [/^juice of\b/, 'jugo de'],
];

const FRACTION_VALUES = {
  '1/8': 0.125,
  '1/6': 0.1667,
  '1/4': 0.25,
  '1/3': 0.3333,
  '3/8': 0.375,
  '1/2': 0.5,
  '5/8': 0.625,
  '2/3': 0.6667,
  '3/4': 0.75,
  '7/8': 0.875,
};

function parseLeadingNumber(text) {
  const value = String(text || '').trim();
  let match = value.match(/^(\d+)\s+(\d)\/(\d)\s*/);
  if (match) {
    return { value: Number(match[1]) + Number(match[2]) / Number(match[3]), rest: value.slice(match[0].length) };
  }
  match = value.match(/^(\d+)\/(\d+)\s*/);
  if (match) {
    return { value: Number(match[1]) / Number(match[2]), rest: value.slice(match[0].length) };
  }
  match = value.match(/^(\d+(?:[.,]\d+)?)\s*/);
  if (match) {
    return { value: Number(match[1].replace(',', '.')), rest: value.slice(match[0].length) };
  }
  match = value.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|half|a|an)\s+/i);
  if (match) {
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5, a: 1, an: 1 };
    return { value: words[match[1].toLocaleLowerCase('en')], rest: value.slice(match[0].length) };
  }
  return { value: null, rest: value };
}

function detectUnit(text) {
  const entry = detectUnitEntry(text);
  return entry ? entry.label : '';
}

function detectUnitEntry(text) {
  const value = String(text || '').trim().toLocaleLowerCase('en');
  if (!value) return null;
  for (const [pattern, label] of UNIT_LABELS) {
    const match = value.match(pattern);
    if (match) return { label, matched: match[0], rest: String(text || '').trim().slice(match[0].length) };
  }
  return null;
}

export function ouncesToMl(oz) {
  return Math.round(Number(oz) * 29.5735 * 10) / 10;
}

// Convierte una medida (local o en inglés) en { cantidad, unidad, texto }.
export function parseMeasure(measure) {
  const raw = String(measure || '').trim();
  if (!raw) return { quantity: 1, unit: 'porción', text: 'Al gusto' };
  const normalized = raw.replace(/[–—]/g, '-');

  const { value, rest } = parseLeadingNumber(normalized);
  const unitEntry = detectUnitEntry(rest) || detectUnitEntry(normalized);
  const unit = unitEntry ? unitEntry.label : '';

  if (value == null) {
    if (/^(as needed|to taste|al gusto)$/i.test(normalized)) return { quantity: 1, unit: 'porción', text: 'Al gusto' };
    if (/juice of/i.test(normalized)) {
      const remainder = normalized.replace(/juice of/i, '').trim();
      const inner = parseLeadingNumber(remainder);
      const innerRest = inner.rest.replace(/^(of|de)\s+/i, '').trim();
      const words = translateIngredientWord(innerRest) || 'pieza';
      return { quantity: inner.value ?? 1, unit: 'pieza', text: `Jugo de ${formatQuantity(inner.value ?? 1)} ${words}`.trim() };
    }
    const words = translateIngredientWord(raw);
    return { quantity: 1, unit: 'porción', text: capitalize(words || raw) };
  }

  if (!unit) {
    const trailing = rest.trim();
    return {
      quantity: value,
      unit: trailing ? 'porción' : 'unidad',
      text: trailing ? `${formatQuantity(value)} ${trailing}` : formatQuantity(value),
    };
  }

  const extra = unitEntry
    ? unitEntry.rest.replace(/^[\s,.-]+/, '').replace(/^(of|de|del)\s+/i, '').trim()
    : rest.trim();

  return {
    quantity: value,
    unit,
    text: formatMeasureText(value, unit, extra),
    extra,
  };
}

function joinExtra(extra, unit = '') {
  const value = String(extra || '').trim();
  if (!value) return '';
  let translated = translateIngredientWord(value);
  if (!translated) return '';
  // "1 twist of lemon peel" → "1 cáscara de limón amarillo" (sin repetir la unidad).
  const unitWord = String(unit || '').toLocaleLowerCase('es');
  if (unitWord && translated.toLocaleLowerCase('es').endsWith(` ${unitWord}`)) {
    translated = translated.slice(0, -1 * (unitWord.length + 1)).trim();
    if (!translated) return '';
  }
  if (/^(de|del|en|con|sin|al|a)\b/i.test(translated)) return ` ${translated}`;
  return ` de ${translated}`;
}

function formatMeasureText(quantity, unit, extra) {
  const extraEs = joinExtra(extra, unit);
  switch (unit) {
    case 'oz': {
      const ml = ouncesToMl(quantity);
      return `${formatQuantity(ml)} ml${extraEs}`;
    }
    case 'cl':
      return `${formatQuantity(quantity * 10)} ml${extraEs}`;
    case 'ml':
      return `${formatQuantity(quantity)} ml${extraEs}`;
    case 'l':
      return `${formatQuantity(quantity)} L${extraEs}`;
    case 'cucharada':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'cucharada' : 'cucharadas'}${extraEs}`;
    case 'cucharadita':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'cucharadita' : 'cucharaditas'}${extraEs}`;
    case 'taza':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'taza' : 'tazas'}${extraEs}`;
    case 'pinta':
      return `${formatQuantity(quantity)} pinta${extraEs}`;
    case 'cuarto':
      return `${formatQuantity(quantity)} cuarto${extraEs}`;
    case 'galón':
      return `${formatQuantity(quantity)} galón${extraEs}`;
    case 'gotas':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'gota' : 'gotas'}${extraEs}`;
    case 'pizca':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'pizca' : 'pizcas'}${extraEs}`;
    case 'chorrito':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'chorrito' : 'chorritos'}${extraEs}`;
    case 'cáscara':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'cáscara' : 'cáscaras'}${extraEs}`;
    case 'rodaja':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'rodaja' : 'rodajas'}${extraEs}`;
    case 'gajo':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'gajo' : 'gajos'}${extraEs}`;
    case 'cubo':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'cubo' : 'cubos'}${extraEs}`;
    case 'rama':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'rama' : 'ramas'}${extraEs}`;
    case 'raja':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'raja' : 'rajas'}${extraEs}`;
    case 'manojo':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'manojo' : 'manojos'}${extraEs}`;
    case 'bolsita':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'bolsita' : 'bolsitas'}${extraEs}`;
    case 'porción':
      return `${formatQuantity(quantity)} porción${extraEs}`;
    case 'hoja':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'hoja' : 'hojas'}${extraEs}`;
    case 'caballito':
      return `${formatQuantity(quantity)} caballito${extraEs}`;
    case 'parte':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'parte' : 'partes'}${extraEs}`;
    case 'lata':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'lata' : 'latas'}${extraEs}`;
    case 'botella':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'botella' : 'botellas'}${extraEs}`;
    case 'vaso':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'vaso' : 'vasos'}${extraEs}`;
    case 'bola':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'bola' : 'bolas'}${extraEs}`;
    case 'pieza':
      return `${formatQuantity(quantity)} ${quantity === 1 ? 'pieza' : 'piezas'}${extraEs}`;
    case 'g':
      return `${formatQuantity(quantity)} g${extraEs}`;
    default:
      return `${formatQuantity(quantity)}${extraEs}`;
  }
}

export function formatQuantity(value) {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  const fraction = FRACTION_VALUES[`${Math.round(rounded * 100) / 100}`];
  if (fraction) return String(fraction);
  return String(rounded).replace('.', ',');
}

const INGREDIENT_WORDS = {
  'liqueur': 'licor',
  'cordial': 'cordiale',
  'lime': 'limón verde',
  'lemon': 'limón amarillo',
  'orange': 'naranja',
  'grapefruit': 'toronja',
  'juice': 'jugo',
  'fresh': 'fresco',
  'chilled': 'frío',
  'crushed': 'molido',
  'cubed': 'en cubos',
  'ice': 'hielo',
  'cold': 'frío',
  'peel': 'cáscara',
  'wedges': 'gajos',
  'slice': 'rodaja',
  'slices': 'rodajas',
  'mint': 'menta',
  'leaf': 'hoja',
  'leaves': 'hojas',
  'cherry': 'cereza',
  'olive': 'aceituna',
  'celery': 'apio',
  'cucumber': 'pepino',
  'strawberry': 'fresa',
  'pineapple': 'piña',
  'banana': 'plátano',
  'coffee': 'café',
  'cream': 'crema',
  'of': 'de',
  'cube': 'cubo',
  'cubes': 'cubos',
  'twist': 'cáscara',
  'dash': 'gota',
  'dashes': 'gotas',
  'splash': 'chorrito',
  'sprig': 'rama',
  'wedge': 'gajo',
  'drop': 'gota',
  'drops': 'gotas',
  'few': 'unas',
  'several': 'varias',
  'over': 'sobre',
  'ingredient': 'ingrediente',
  'ingredients': 'ingredientes',
  'half': 'mitad',
  'gently': 'con cuidado',
  'rum': 'ron',
  'gin': 'ginebra',
  'whiskey': 'whisky',
  'whisky': 'whisky',
  'brandy': 'brandy',
  'tequila': 'tequila',
  'vodka': 'vodka',
  'alcohol': 'alcohol',
  'and': 'y',
  'milk': 'leche',
  'sugar': 'azúcar',
  'salt': 'sal',
  'water': 'agua',
  'soda': 'refresco',
  'cola': 'cola',
  'ginger': 'jengibre',
  'mango': 'mango',
  'peach': 'durazno',
  'apple': 'manzana',
  'raspberry': 'frambuesa',
  'blackberry': 'zarzamora',
  'blueberry': 'arándano',
  'watermelon': 'sandía',
  'coconut': 'coco',
  'vanilla': 'vainilla',
  'cinnamon': 'canela',
  'chocolate': 'chocolate',
  'honey': 'miel',
  'egg': 'huevo',
  'white': 'blanco',
  'red': 'rojo',
  'green': 'verde',
  'dark': 'oscuro',
  'sweet': 'dulce',
  'dry': 'seco',
  'powder': 'en polvo',
  'syrup': 'jarabe',
  'bitter': 'amargo',
};

export function translateIngredientWord(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const words = raw.split(/\s+/);
  const translated = words.map((word) => {
    const clean = word.replace(/[.,;]$/, '').toLocaleLowerCase('en');
    return INGREDIENT_WORDS[clean] || word;
  });
  // "lime juice" → "jugo de limón", "pineapple juice" → "jugo de piña"…
  let result = translated.join(' ').replace(/^(.+?)\s+(jugo)\b/, 'jugo de $1');
  // Evita repetir "cáscara" cuando la medida ya la menciona ("twist of lemon peel").
  if (result.split('cáscara').length > 2) {
    result = result.replace(/\s+cáscara$/, '');
  }
  return result;
}

// Nombre en español de un ingrediente del catálogo internacional.
export function translateIngredientName(name) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  const known = INGREDIENTS[raw];
  if (known) return known.es;
  const normalized = normalizeText(raw);
  const direct = Object.entries(INGREDIENTS).find(([key, value]) => normalizeText(key) === normalized || normalizeText(value.es) === normalized);
  if (direct) return direct[1].es;

  let guess = translateIngredientWord(raw);
  const suffixRules = [
    [/\bjuice\b/i, 'jugo de'],
    [/\bsyrup\b/i, 'jarabe de'],
    [/\bsoda\b/i, 'refresco de'],
    [/\bliqueur\b/i, 'licor de'],
    [/\bcream\b/i, 'crema de'],
    [/\bwine\b/i, 'vino'],
    [/\btea\b/i, 'té'],
    [/\bpowder\b/i, 'en polvo'],
  ];
  for (const [pattern, replacement] of suffixRules) {
    if (pattern.test(raw) && !guess.toLocaleLowerCase('es').includes(replacement.split(' ')[0])) {
      guess = guess.replace(pattern, replacement);
    }
  }
  guess = guess.replace(/\s+/g, ' ').trim();
  if (!guess || guess === raw) {
    if (!/[a-z]/i.test(raw)) return raw;
    return capitalize(raw);
  }
  return capitalize(guess);
}

export function capitalize(text) {
  const value = String(text || '');
  if (!value) return '';
  return value.charAt(0).toLocaleUpperCase('es') + value.slice(1);
}

// ── Instrucciones ──────────────────────────────────────────────────────────

const GLASS_WORDS = {
  highball: 'alto',
  cocktail: 'de cóctel',
  martini: 'martini',
  'old-fashioned': 'old fashioned',
  collins: 'collins',
  hurricane: 'huracán',
  pint: 'de pinta',
  shot: 'de chupito',
  wine: 'de vino',
  champagne: 'flauta',
  'pousse': 'pousse café',
  irish: 'irlandés',
  coffee: 'de café',
  beer: 'cervecero',
};

function glassLabel(word) {
  const value = String(word || '').trim().toLocaleLowerCase('en');
  return GLASS_WORDS[value] || value;
}

const CUT_WORDS = {
  wedge: 'gajo',
  wedges: 'gajos',
  slice: 'rodaja',
  slices: 'rodajas',
  twist: 'cáscara',
  twists: 'cáscaras',
  peel: 'cáscara',
};

const JUICE_FRUITS = {
  tomato: 'tomate',
  cranberry: 'arándano',
  grapefruit: 'toronja',
  peach: 'durazno',
  watermelon: 'sandía',
  tomatoe: 'tomate',
};

const FRUIT_WORDS = {
  lime: 'limón verde',
  lemon: 'limón amarillo',
  orange: 'naranja',
  pineapple: 'piña',
  apple: 'manzana',
  cucumber: 'pepino',
};

const INSTRUCTION_RULES = [
  // 1. Frases de preparación (incluyen el vaso, van antes de las reglas de vasos).
  [/\bpour all (?:of the )?ingredients into (?:a |an |the )?(?:shaker|mixer)\b(?:\s+with ice)?/gi, 'vierte todos los ingredientes en una coctelera con hielo'],
  [/\bpour all (?:of the )?ingredients into (?:a |an |the )?blender\b/gi, 'vierte todos los ingredientes en la licuadora'],
  [/\bpour all (?:of the )?ingredients\b/gi, 'vierte todos los ingredientes'],
  [/\brub the rim of the glass with\b/gi, 'escarcha el borde del vaso con'],
  [/\brub the rim with\b/gi, 'escarcha el borde con'],
  [/\brim the glass with\b/gi, 'escarcha el vaso con'],
  [/\bdip the (?:glass|rim) in\b/gi, 'moja el borde del vaso en'],
  [/\bfill (?:the |a )?(?:glass|mug|jar) with (?:crushed )?ice\b/gi, 'llena el vaso con hielo'],
  [/\bfilled with (?:crushed )?ice\b/gi, 'lleno de hielo'],
  [/\bstrain into (?:a |an |the )?chilled (?:cocktail|martini) glass\b/gi, 'cuela en una copa fría'],
  [/\bstrain into (?:a |an |the )?(highball|cocktail|martini|collins|hurricane|pint|shot|wine|champagne|old-fashioned|irish|coffee|beer|balloon|coupe|cordial|parfait|sour|brandy|sherry|port|pousse cafe|clear|mason|nick and nora|whiskey sour) glass\b/gi, (match, glass) => `cuela en un vaso ${glassLabel(glass)}`],
  [/\bstrain into (?:a |an |the )?glass\b/gi, 'cuela en el vaso'],
  [/\binto (?:a |an )?(highball|cocktail|martini|collins|hurricane|pint|shot|wine|champagne|old-fashioned|irish|coffee|beer|balloon|coupe|cordial|parfait|sour|brandy|sherry|port|pousse cafe|clear|mason|nick and nora|whiskey sour) glass\b/gi, (match, glass) => `en un vaso ${glassLabel(glass)}`],
  [/\bin (?:a |an )?(highball|cocktail|martini|collins|hurricane|pint|shot|wine|champagne|old-fashioned|irish|coffee|beer|balloon|coupe|cordial|parfait|sour|brandy|sherry|port|pousse cafe|clear|mason|nick and nora|whiskey sour) glass\b/gi, (match, glass) => `en un vaso ${glassLabel(glass)}`],
  [/\bserve (?:it )?in (?:a |an )?(highball|cocktail|martini|collins|hurricane|pint|shot|wine|champagne|old-fashioned|irish|coffee|beer|balloon|coupe|cordial|parfait|sour|brandy|sherry|port|pousse cafe|clear|mason|nick and nora|whiskey sour) glass\b/gi, (match, glass) => `sirve en un vaso ${glassLabel(glass)}`],

  // 2. Verbos principales.
  [/\bshake\b(?:\s+(?:all|the|everything|well|vigorously|together))?(?:\s+(?:of the))?(?:\s+ingredients?)?(?:\s+(?:with|over))?(?:\s+(?:crushed\s+)?ice)?/gi, 'agita bien con hielo'],
  [/\bstir\b(?:\s+(?:well|gently|briefly|together))?/gi, 'revuelve bien'],
  [/\bmix\b(?:\s+(?:well|together|the ingredients|all of the ingredients|all ingredients|everything))?/gi, 'mezcla'],
  [/\bcombine\b(?:\s+(?:all of the ingredients|all ingredients|the ingredients))?/gi, 'combina los ingredientes'],
  [/\bblend\b(?:\s+(?:all of the ingredients|all ingredients|the ingredients))?/gi, 'licúa'],
  [/\bmuddle\b/gi, 'machaca'],
  [/\bgarnish with\b/gi, 'decora con'],
  [/\bgarnish\b/gi, 'decora'],
  [/\bstrain\b/gi, 'cuela'],
  [/\bfill with\b/gi, 'completa con'],
  [/\btop (?:it )?up with\b/gi, 'completa con'],
  [/\btop with\b/gi, 'completa con'],
  [/\bfill\b/gi, 'llena'],
  [/\bserve\b(?:\s+(?:immediately|over ice|cold|chilled|with ice))?/gi, 'sirve'],
  [/\benjoy\b/gi, 'disfruta'],
  [/\bdip in\b/gi, 'moja en'],
  [/\badd\b(?:\s+(?:all of the ingredients|all ingredients|the ingredients|ingredients|everything|ice))?/gi, 'agrega'],
  [/\bpour\b/gi, 'vierte'],
  [/\bplace\b/gi, 'coloca'],
  [/\bsqueeze\b/gi, 'exprime'],
  [/\bcut\b/gi, 'corta'],
  [/\bcrack\b/gi, 'quiebra'],
  [/\bfloat\b/gi, 'flota'],
  [/\bswirl\b/gi, 'gira el vaso'],
  [/\bwatch\b/gi, 'vigila'],
  [/\bmake sure\b/gi, 'asegúrate de'],
  [/\brepeat\b/gi, 'repite'],
  [/\bcrush\b/gi, 'machaca'],

  // 3. Utensilios, vasos y detalles.
  [/\b(?:to|into|in) (?:a |an )?(?:shaker|mixer)\b/gi, 'en una coctelera'],
  [/\b(?:to|into|in) (?:a |an )?blender\b/gi, 'en la licuadora'],
  [/\b(?:a |an )?(highball|cocktail|martini|collins|hurricane|pint|shot|wine|champagne|old-fashioned|irish|coffee|beer|balloon|coupe|cordial|parfait|sour|brandy|sherry|port|pousse cafe|clear|mason|nick and nora|whiskey sour) glass\b/gi, (match, glass) => `vaso ${glassLabel(glass)}`],
  [/\bin (?:a |an )?glass\b/gi, 'en un vaso'],
  [/\b(?:a |an )?glass\b/gi, 'un vaso'],
  [/\b(?:shaker|mixer)\b/gi, 'coctelera'],
  [/\bblender\b/gi, 'licuadora'],
  [/\bstrainer\b/gi, 'colador'],
  [/\bbar spoon\b/gi, 'cuchara de bar'],
  [/\bginger ale\b/gi, 'refresco de jengibre'],
  [/\bsoda water\b/gi, 'agua mineral'],
  [/\btonic water\b/gi, 'agua tónica'],
  [/\bcrushed ice\b/gi, 'hielo molido'],
  [/\bice cubes?\b/gi, 'hielo en cubos'],
  [/\b(?:a |an )?dash(?:es)?\b/gi, 'gotas de'],
  [/\b(?:a |an )?splash\b/gi, 'chorrito de'],

  // 4. Jugos, cortes y adornos.
  [/\b(lime|lemon|orange|pineapple|tomato|cranberry|grapefruit|apple|mango|peach|watermelon|passion fruit)\s+juice\b/gi,
    (match, fruit) => `jugo de ${FRUIT_WORDS[fruit.toLocaleLowerCase('en')] || JUICE_FRUITS[fruit.toLocaleLowerCase('en')] || fruit}`],
  [/\b(?:a |an |the )?(lime|lemon|orange|pineapple|apple|cucumber) (wedge|wedges|slice|slices|twist|twists|peel)\b/gi,
    (match, fruit, cut) => `${CUT_WORDS[cut.toLocaleLowerCase('en')] || 'gajo'} de ${FRUIT_WORDS[fruit.toLocaleLowerCase('en')] || fruit}`],

  // 5. Enlaces y matices.
  [/\buntil\b(?:\s+(?:well\s+)?(?:chilled|combined|smooth|dissolved|mixed))?/gi, 'hasta que quede bien mezclado'],
  [/\bfor (\d+) (minutes?|seconds?|hours?)\b/gi, 'durante $1 $2'],
  [/\bon the rocks\b/gi, 'con hielo'],
  [/\bwith ice\b/gi, 'con hielo'],
  [/\bthen\b/gi, 'luego'],
  [/\bover\b/gi, 'sobre'],
  [/\binto\b/gi, 'en'],
  [/\bin the\b/gi, 'en el'],
  [/\bin (?:a |an )?/gi, 'en una '],
  [/\bwith\b/gi, 'con'],
  [/\band\b/gi, 'y'],
  [/\bthe\b/gi, 'el'],
  [/\btogether\b/gi, 'juntos'],
  [/\bwell\b/gi, 'bien'],
  [/\bcold\b/gi, 'frío'],
  [/\bchilled\b/gi, 'frío'],
  [/\bsmooth\b/gi, 'suave'],
  [/\bimmediately\b/gi, 'de inmediato'],
  [/\bto\b/gi, 'a'],
  [/\bfor\b/gi, 'para'],
  [/\bof the\b/gi, 'del'],

  [/\bof\b/gi, 'de'],
  [/\bice\b/gi, 'hielo'],
];

const ENGLISH_MARKERS = /\b(the|and|with|into|until|pour|shake|strain|serve|garnish|stir|add|mix|blend|glass|ice|juice|lime|lemon|sugar|water|muddle|shaker|filled|rim|dash|splash|top|fill|crush)\b/i;
const SPANISH_MARKERS = /\b(agrega|vierte|mezcla|revuelve|sirve|hielo|vaso|copa|con|escarcha|licúa|decora|coctelera|colador|ingredientes|hasta|frío|decorar)\b/i;

function applyRules(text) {
  let result = text;
  for (const [pattern, replacement] of INSTRUCTION_RULES) {
    result = typeof replacement === 'function'
      ? result.replace(pattern, replacement)
      : result.replace(pattern, replacement);
  }
  // Nombres de ingredientes que sigan en inglés.
  result = result.replace(/\b[a-z]{3,}\b/gi, (word) => {
    const translated = INGREDIENT_WORDS[word.toLocaleLowerCase('en')];
    return translated || word;
  });
  // Artículos ingleses que quedaron sueltos delante de un ingrediente.
  result = result.replace(
    /\b(?:a|an|the)\s+(?=(?:aceituna|limón|limon|naranja|cereza|menta|apio|piña|pina|fresa|frambuesa|hielo|sal|azúcar|azucar|crema|leche|café|cafe|agua|jugo|ron|tequila|vodka|ginebra|whisky|licor|cerveza|vino|jarabe|salsa|amargo|jengibre|canela|chocolate|miel|huevo|arándano|sandía)s?\b)/gi,
    '',
  );
  return result
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function translateInstructions(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const looksSpanish = SPANISH_MARKERS.test(raw) && !ENGLISH_MARKERS.test(raw);
  if (looksSpanish) return raw;

  const translated = applyRules(raw);
  const result = translated
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => capitalize(sentence.trim()))
    .join(' ');

  const leftoverEnglish = ENGLISH_MARKERS.test(result) && !SPANISH_MARKERS.test(result);
  return { text: capitalize(result), automatic: true, stillEnglish: leftoverEnglish };
}
