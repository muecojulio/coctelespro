// Diccionario central de insumos.
//
// - `es`: nombre en español que se muestra en la app.
// - `cat`: familia usada para estimar precios de insumos desconocidos.
// - `base`: unidad en la que se mide ('ml', 'g' o 'pieza').
// - `pack`: presentación de compra y precio de referencia en MXN.
// - `aliases`: otras formas en las que la gente escribe el insumo (búsqueda por texto).
//
// Los precios son referencias de mercado en México y se pueden editar dentro de
// la pestaña "Costos"; lo que se guarda en localStorage siempre tiene prioridad.

function def(es, cat, base, size, price, label, aliases = []) {
  return { es, cat, base, pack: { size, price, label }, aliases };
}

export const INGREDIENTS = {
  // ── Destilados ─────────────────────────────────────────────────────────────
  Tequila: def('Tequila', 'destilado', 'ml', 750, 260, 'Botella 750 ml', ['tequila blanco', 'tequila reposado', 'tequila 100 agave']),
  Mezcal: def('Mezcal', 'destilado', 'ml', 750, 360, 'Botella 750 ml', ['mezcal espadin']),
  Rum: def('Ron', 'destilado', 'ml', 750, 220, 'Botella 750 ml', ['ron blanco', 'bacardi']),
  'White rum': def('Ron blanco', 'destilado', 'ml', 750, 220, 'Botella 750 ml', ['ron claro']),
  'Dark rum': def('Ron añejo', 'destilado', 'ml', 750, 290, 'Botella 750 ml', ['ron oscuro', 'ron viejo']),
  Vodka: def('Vodka', 'destilado', 'ml', 750, 195, 'Botella 750 ml', ['vodka barato']),
  Gin: def('Ginebra', 'destilado', 'ml', 750, 235, 'Botella 750 ml', ['gin', 'ginebra london dry']),
  Whiskey: def('Whisky', 'destilado', 'ml', 750, 330, 'Botella 750 ml', ['whisky', 'güisqui']),
  Bourbon: def('Bourbon', 'destilado', 'ml', 750, 380, 'Botella 750 ml', ['whisky americano']),
  Brandy: def('Brandy', 'destilado', 'ml', 700, 185, 'Botella 700 ml', ['coñac barato']),
  Cognac: def('Coñac', 'destilado', 'ml', 700, 520, 'Botella 700 ml', ['cognac']),
  Pisco: def('Pisco', 'destilado', 'ml', 750, 300, 'Botella 750 ml', []),
  'Cachaça': def('Cachaça', 'destilado', 'ml', 750, 300, 'Botella 750 ml', ['cachaza', 'cana']),

  // ── Licores y aperitivos ───────────────────────────────────────────────────
  'Triple sec': def('Triple sec', 'licor', 'ml', 700, 185, 'Botella 700 ml', ['licor de naranja', 'cointreau', 'grand marnier', 'controy']),
  Amaretto: def('Amaretto', 'licor', 'ml', 750, 320, 'Botella 750 ml', ['licor de almendra']),
  'Coffee liqueur': def('Licor de café', 'licor', 'ml', 700, 300, 'Botella 700 ml', ['kahlua', 'kahlúa']),
  Baileys: def('Crema irlandesa', 'licor', 'ml', 750, 330, 'Botella 750 ml', ['baileys', 'licor de crema']),
  'Blue curacao': def('Curazao azul', 'licor', 'ml', 700, 250, 'Botella 700 ml', ['blue curacao', 'curaçao azul']),
  'Peach schnapps': def('Licor de durazno', 'licor', 'ml', 700, 260, 'Botella 700 ml', ['schapps de durazno', 'licor de melocoton']),
  Midori: def('Midori', 'licor', 'ml', 700, 380, 'Botella 700 ml', ['licor de melon']),
  Aperol: def('Aperol', 'licor', 'ml', 750, 450, 'Botella 750 ml', []),
  Campari: def('Campari', 'licor', 'ml', 750, 480, 'Botella 750 ml', ['bitter italiano']),
  Vermouth: def('Vermut rojo', 'licor', 'ml', 750, 200, 'Botella 750 ml', ['vermout rojo', 'martini rosso']),
  'Dry vermouth': def('Vermut seco', 'licor', 'ml', 750, 220, 'Botella 750 ml', ['vermout blanco', 'martini dry']),
  'Elderflower cordial': def('Cordial de saúco', 'licor', 'ml', 500, 280, 'Botella 500 ml', ['sauco']),
  Bitters: def('Amargo aromático', 'licor', 'ml', 200, 120, 'Frasco 200 ml', ['angostura', 'bitter']),

  // ── Vinos y espumosos ──────────────────────────────────────────────────────
  Champagne: def('Champaña', 'vino', 'ml', 750, 420, 'Botella 750 ml', ['champan', 'espumoso brut', 'vino espumoso seco']),
  Prosecco: def('Prosecco', 'vino', 'ml', 750, 280, 'Botella 750 ml', ['vino espumoso']),
  'Red wine': def('Vino tinto', 'vino', 'ml', 750, 180, 'Botella 750 ml', ['tinto de mesa', 'vino rojo']),
  'White wine': def('Vino blanco', 'vino', 'ml', 750, 170, 'Botella 750 ml', ['blanco de mesa']),
  'Rosé wine': def('Vino rosado', 'vino', 'ml', 750, 175, 'Botella 750 ml', ['vino rose']),
  Cider: def('Sidra', 'vino', 'ml', 355, 32, 'Botella 355 ml', ['sidra de manzana']),

  // ── Cervezas ───────────────────────────────────────────────────────────────
  Beer: def('Cerveza clara', 'cerveza', 'ml', 355, 22, 'Lata 355 ml', ['cerveza', 'birra', 'cheve', 'lager', 'pilsner']),
  'Stout beer': def('Cerveza stout', 'cerveza', 'ml', 355, 48, 'Botella 355 ml', ['cerveza negra', 'stout', 'porter']),
  'Non-alcoholic beer': def('Cerveza sin alcohol', 'cerveza', 'ml', 355, 20, 'Lata 355 ml', ['cerveza zero', 'cerveza 0.0']),

  // ── Refrescos y mezcladores ────────────────────────────────────────────────
  'Soda water': def('Agua mineral', 'refresco', 'ml', 2000, 25, 'Botella 2 L', ['agua con gas', 'club soda', 'agua carbonatada']),
  'Tonic water': def('Agua tónica', 'refresco', 'ml', 1000, 30, 'Botella 1 L', ['tonica', 'schweppes tonica']),
  'Coca-Cola': def('Refresco de cola', 'refresco', 'ml', 2000, 35, 'Botella 2 L', ['coca cola', 'coca', 'cola', 'pepsi']),
  'Lemon-lime soda': def('Refresco de limón', 'refresco', 'ml', 2000, 30, 'Botella 2 L', ['sprite', 'seven up', '7up', 'squirt de limon']),
  'Ginger ale': def('Ginger ale', 'refresco', 'ml', 2000, 38, 'Botella 2 L', ['refresco de jengibre']),
  'Ginger beer': def('Cerveza de jengibre', 'refresco', 'ml', 355, 45, 'Botella 355 ml', ['ginger beer']),
  'Grapefruit soda': def('Refresco de toronja', 'refresco', 'ml', 2000, 32, 'Botella 2 L', ['squirt', 'toronja', 'fresca', 'sangria senorial']),
  'Orange soda': def('Refresco de naranja', 'refresco', 'ml', 2000, 32, 'Botella 2 L', ['mirinda', 'fanta']),
  Clamato: def('Clamato', 'refresco', 'ml', 1000, 46, 'Botella 1 L', ['jugo de almeja', 'sangrita embotellada']),

  // ── Jugos y pulpas ─────────────────────────────────────────────────────────
  'Tomato juice': def('Jugo de tomate', 'jugo', 'ml', 1000, 36, 'Botella 1 L', ['tomate']),
  'Orange juice': def('Jugo de naranja', 'jugo', 'ml', 1000, 40, 'Botella 1 L', ['naranja']),
  'Lime juice': def('Jugo de limón', 'jugo', 'ml', 500, 40, 'Botella 500 ml', ['limon', 'limón verde', 'jugo de limon verde']),
  'Lemon juice': def('Jugo de limón amarillo', 'jugo', 'ml', 500, 42, 'Botella 500 ml', ['limon amarillo', 'limon real']),
  'Grapefruit juice': def('Jugo de toronja', 'jugo', 'ml', 1000, 40, 'Botella 1 L', ['jugo de pomelo']),
  'Pineapple juice': def('Jugo de piña', 'jugo', 'ml', 1000, 38, 'Botella 1 L', ['piña', 'jugo de pina']),
  'Cranberry juice': def('Jugo de arándano', 'jugo', 'ml', 1000, 55, 'Botella 1 L', ['arandano rojo', 'cranberry']),
  'Apple juice': def('Jugo de manzana', 'jugo', 'ml', 1000, 35, 'Botella 1 L', ['manzana']),
  'Mango juice': def('Jugo de mango', 'jugo', 'ml', 1000, 40, 'Botella 1 L', ['mango']),
  'Peach juice': def('Néctar de durazno', 'jugo', 'ml', 1000, 38, 'Botella 1 L', ['durazno', 'melocoton']),
  'Passion fruit juice': def('Jugo de maracuyá', 'jugo', 'ml', 500, 60, 'Botella 500 ml', ['maracuya', 'parchita']),
  'Watermelon juice': def('Jugo de sandía', 'jugo', 'ml', 1000, 35, 'Botella 1 L', ['sandia']),

  // ── Lácteos y cremas ───────────────────────────────────────────────────────
  Milk: def('Leche', 'lacteo', 'ml', 1000, 28, 'Envase 1 L', ['leche entera']),
  Cream: def('Crema', 'lacteo', 'ml', 500, 55, 'Envase 500 ml', ['crema para batir', 'nata']),
  'Condensed milk': def('Leche condensada', 'lacteo', 'g', 400, 45, 'Lata 400 g', ['lechera']),
  'Coconut cream': def('Crema de coco', 'lacteo', 'ml', 400, 52, 'Envase 400 ml', ['crema de coco espesa']),
  'Coconut milk': def('Leche de coco', 'lacteo', 'ml', 400, 46, 'Envase 400 ml', ['leche de coco light']),
  'Whipped cream': def('Crema batida', 'lacteo', 'ml', 400, 48, 'Envase 400 ml', ['crema en aerosol']),
  'Ice cream': def('Nieve', 'lacteo', 'ml', 1000, 90, 'Envase 1 L', ['helado']),

  // ── Frutas y vegetales ─────────────────────────────────────────────────────
  Lime: def('Limón verde', 'fruta', 'pieza', 1, 4, 'Pieza', ['limon entero', 'limon verde entero', 'lima']),
  Lemon: def('Limón amarillo', 'fruta', 'pieza', 1, 6, 'Pieza', ['limon real entero']),
  Orange: def('Naranja', 'fruta', 'pieza', 1, 6, 'Pieza', ['naranja valencia']),
  Grapefruit: def('Toronja', 'fruta', 'pieza', 1, 9, 'Pieza', ['pomelo']),
  Strawberry: def('Fresa', 'fruta', 'g', 500, 45, 'Charola 500 g', ['fresas']),
  Raspberry: def('Frambuesa', 'fruta', 'g', 250, 60, 'Charola 250 g', ['frambuesas']),
  Blueberry: def('Arándano azul', 'fruta', 'g', 250, 55, 'Charola 250 g', ['blueberry']),
  Blackberry: def('Zarzamora', 'fruta', 'g', 250, 50, 'Charola 250 g', ['mora']),
  Banana: def('Plátano', 'fruta', 'pieza', 1, 4, 'Pieza', ['platano tabasco', 'banana']),
  Pineapple: def('Piña', 'fruta', 'pieza', 1, 38, 'Pieza', ['pina entera']),
  Watermelon: def('Sandía', 'fruta', 'g', 1000, 18, 'Kilogramo', ['sandia entera']),
  Mango: def('Mango', 'fruta', 'pieza', 1, 18, 'Pieza', ['mango ataulfo']),
  Peach: def('Durazno', 'fruta', 'pieza', 1, 14, 'Pieza', ['melocoton entero']),
  Apple: def('Manzana', 'fruta', 'pieza', 1, 8, 'Pieza', ['manzana roja']),
  Cucumber: def('Pepino', 'fruta', 'pieza', 1, 7, 'Pieza', []),
  Celery: def('Apio', 'fruta', 'pieza', 1, 18, 'Manojo', ['apio entero']),
  Olive: def('Aceituna', 'fruta', 'pieza', 200, 35, 'Frasco 200 g', ['aceitunas verdes']),
  Cherry: def('Cereza', 'fruta', 'pieza', 300, 58, 'Frasco 300 g', ['cereza marrasquino', 'cerezas al marrasquino']),
  Mint: def('Menta', 'hierba', 'pieza', 1, 15, 'Manojo', ['hierbabuena', 'yerbabuena']),
  Basil: def('Albahaca', 'hierba', 'pieza', 1, 15, 'Manojo', ['albahaca fresca']),

  // ── Endulzantes y jarabes ──────────────────────────────────────────────────
  Sugar: def('Azúcar', 'abarrote', 'g', 1000, 28, 'Kilogramo', ['azucar blanca', 'azucar estandar']),
  'Sugar syrup': def('Jarabe natural', 'jarabe', 'ml', 750, 62, 'Botella 750 ml', ['jarabe simple', 'simple syrup', 'almibar']),
  Honey: def('Miel', 'jarabe', 'g', 500, 92, 'Envase 500 g', ['miel de abeja']),
  'Agave syrup': def('Jarabe de agave', 'jarabe', 'ml', 750, 95, 'Botella 750 ml', ['miel de agave']),
  Grenadine: def('Granadina', 'jarabe', 'ml', 750, 75, 'Botella 750 ml', ['jarabe de granada']),
  'Tamarind syrup': def('Jarabe de tamarindo', 'jarabe', 'ml', 750, 72, 'Botella 750 ml', ['tamarindo']),
  'Orgeat syrup': def('Jarabe de orgeat', 'jarabe', 'ml', 750, 185, 'Botella 750 ml', ['jarabe de almendra']),
  'Chocolate syrup': def('Jarabe de chocolate', 'jarabe', 'ml', 500, 60, 'Botella 500 ml', ['salsa de chocolate']),
  'Caramel syrup': def('Jarabe de caramelo', 'jarabe', 'ml', 500, 60, 'Botella 500 ml', ['salsa de caramelo']),
  Piloncillo: def('Piloncillo', 'abarrote', 'g', 500, 42, 'Envase 500 g', ['panela', 'azucar morena']),
  'Vanilla extract': def('Extracto de vainilla', 'abarrote', 'ml', 250, 62, 'Frasco 250 ml', ['vainilla']),

  // ── Básicos de cocina ──────────────────────────────────────────────────────
  Ice: def('Hielo', 'hielo', 'g', 2000, 25, 'Bolsa 2 kg', ['hielos', 'hielo en cubos']),
  Water: def('Agua', 'agua', 'ml', 20000, 45, 'Garrafón 20 L', ['agua potable', 'agua simple']),
  Rice: def('Arroz', 'abarrote', 'g', 1000, 32, 'Kilogramo', ['arroz blanco']),
  Cornstarch: def('Maicena', 'abarrote', 'g', 500, 35, 'Caja 500 g', ['fecula de maiz', 'almidon de maiz']),
  Salt: def('Sal', 'especia', 'g', 1000, 16, 'Kilogramo', ['sal de mesa', 'sal gruesa']),
  'Black pepper': def('Pimienta negra', 'especia', 'g', 50, 26, 'Frasco 50 g', ['pimienta molida']),
  'Chili powder': def('Chile en polvo', 'especia', 'g', 50, 22, 'Frasco 50 g', ['chile piquin en polvo', 'tajin']),
  Cinnamon: def('Canela', 'especia', 'pieza', 1, 6, 'Raja', ['canela en raja', 'canela molida']),
  Cloves: def('Clavo', 'especia', 'pieza', 1, 2, 'Pieza', ['clavo de olor']),
  Nutmeg: def('Nuez moscada', 'especia', 'g', 25, 32, 'Frasco 25 g', []),
  Ginger: def('Jengibre', 'especia', 'g', 250, 26, 'Envase 250 g', ['raiz de jengibre']),
  'Hot sauce': def('Salsa picante', 'salsa', 'ml', 250, 32, 'Frasco 250 ml', ['tabasco', 'salsa valentina', 'chile']),
  'Worcestershire sauce': def('Salsa inglesa', 'salsa', 'ml', 250, 36, 'Frasco 250 ml', ['worcestershire', 'salsa perrins']),
  'Soy sauce': def('Salsa de soya', 'salsa', 'ml', 250, 35, 'Frasco 250 ml', ['salsa soya']),
  'Chocolate': def('Chocolate de mesa', 'abarrote', 'g', 90, 26, 'Tableta 90 g', ['chocolate abuelita', 'chocolate de tablilla']),
  'Cacao powder': def('Cacao en polvo', 'abarrote', 'g', 200, 62, 'Envase 200 g', ['cocoa']),
  Egg: def('Huevo', 'huevo', 'pieza', 1, 5, 'Pieza', ['huevos', 'huevo entero']),
  'Egg white': def('Clara de huevo', 'huevo', 'pieza', 1, 4, 'Pieza', ['claras de huevo']),

  // ── Café, té e infusiones ──────────────────────────────────────────────────
  Coffee: def('Café preparado', 'cafe', 'ml', 1000, 85, 'Litro preparado', ['cafe de olla', 'cafe negro']),
  Espresso: def('Espresso', 'cafe', 'ml', 1000, 140, 'Litro preparado', ['cafe expreso', 'shot de espresso']),
  Tea: def('Té', 'cafe', 'pieza', 1, 3, 'Bolsita', ['bolsita de te', 'te negro', 'te verde']),
  Chamomile: def('Manzanilla', 'cafe', 'g', 50, 26, 'Frasco 50 g', ['flor de manzanilla']),
  'Hibiscus flower': def('Flor de jamaica', 'cafe', 'g', 250, 48, 'Bolsa 250 g', ['jamaica']),
  'Coffee beans': def('Café en grano', 'cafe', 'g', 500, 130, 'Bolsa 500 g', ['grano de cafe']),
};

// Familias de insumos con precio estimado, usadas cuando llega un ingrediente
// del catálogo internacional que no está en el diccionario.
const FALLBACK_BY_CATEGORY = {
  destilado: def('', 'destilado', 'ml', 750, 280, 'Botella 750 ml'),
  licor: def('', 'licor', 'ml', 700, 290, 'Botella 700 ml'),
  cerveza: def('', 'cerveza', 'ml', 355, 30, 'Lata 355 ml'),
  vino: def('', 'vino', 'ml', 750, 200, 'Botella 750 ml'),
  refresco: def('', 'refresco', 'ml', 2000, 32, 'Botella 2 L'),
  jugo: def('', 'jugo', 'ml', 1000, 42, 'Botella 1 L'),
  lacteo: def('', 'lacteo', 'ml', 1000, 45, 'Envase 1 L'),
  fruta: def('', 'fruta', 'pieza', 1, 12, 'Pieza'),
  jarabe: def('', 'jarabe', 'ml', 750, 85, 'Botella 750 ml'),
  especia: def('', 'especia', 'g', 50, 26, 'Frasco 50 g'),
  salsa: def('', 'salsa', 'ml', 250, 34, 'Frasco 250 ml'),
  abarrote: def('', 'abarrote', 'g', 500, 40, 'Envase 500 g'),
  hielo: def('', 'hielo', 'g', 2000, 25, 'Bolsa 2 kg'),
  agua: def('', 'agua', 'ml', 20000, 45, 'Garrafón 20 L'),
  cafe: def('', 'cafe', 'g', 500, 120, 'Bolsa 500 g'),
  hierba: def('', 'hierba', 'pieza', 1, 15, 'Manojo'),
  huevo: def('', 'huevo', 'pieza', 1, 5, 'Pieza'),
};

const CATEGORY_KEYWORDS = [
  [/tequila|mezcal|vodka|gin|ginebra|ron|rum|whisk|bourbon|brandy|cognac|pisco|cachac|sake|soju|absint|schapps|schnapps|whiskey/i, 'destilado'],
  [/liqueur|licor|triple sec|curacao|curaçao|amaretto|baileys|midori|vermouth|vermout|amaro|campari|aperol|chartreuse|bitters/i, 'licor'],
  [/beer|cerveza|lager|stout|ale|pilsner|cider|sidra/i, 'cerveza'],
  [/wine|vino|champagne|champan|prosecco|spumante|cava|sherry|jerez|port/i, 'vino'],
  [/soda|tonic|cola|ginger ale|refresco|sprite|7-up|lemonade soda/i, 'refresco'],
  [/juice|jugo|nectar|néctar|pure|puré|pulp|pulpa/i, 'jugo'],
  [/milk|cream|leche|crema|yogur|yogurt|helado|ice cream/i, 'lacteo'],
  [/syrup|jarabe|grenadine|granadina|honey|miel|sugar|azucar|azúcar/i, 'jarabe'],
  [/salt|sal\b|pepper|pimienta|cinnamon|canela|nutmeg|clove|clavo|spice|chili|chile|pepper|cumin|comino|oregano|orégano/i, 'especia'],
  [/sauce|salsa|ketchup|mustard|mostaza|mayo/i, 'salsa'],
  [/berry|berries|fresa|strawberry|apple|manzana|orange|naranja|lemon|limón|limon|lime|mango|peach|durazno|banana|platano|plátano|pineapple|piña|pina|watermelon|sandia|sandía|grape|uva|cherry|cereza|pear|pera|kiwi|melon|melón|citrus/i, 'fruta'],
  [/mint|menta|basil|albahaca|herb|hierba|cilantro|parsley/i, 'hierba'],
  [/egg|huevo/i, 'huevo'],
  [/coffee|cafe|café|espresso|tea|té|te\b|chocolate|cacao|cocoa/i, 'cafe'],
  [/ice|hielo/i, 'hielo'],
  [/water|agua/i, 'agua'],
];

export function guessCategory(name) {
  const value = String(name || '');
  for (const [pattern, category] of CATEGORY_KEYWORDS) {
    if (pattern.test(value)) return category;
  }
  return 'abarrote';
}

// Devuelve la ficha completa de un insumo: traducción, categoría, presentación y precio.
// Si el insumo no está en el diccionario se estima a partir de su nombre.
export function getIngredient(keyOrName) {
  const raw = String(keyOrName || '').trim();
  const known = INGREDIENTS[raw];
  if (known) return { key: raw, ...known, estimated: false };
  const category = guessCategory(raw);
  const fallback = FALLBACK_BY_CATEGORY[category] || FALLBACK_BY_CATEGORY.abarrote;
  return { key: raw, es: raw, cat: category, base: fallback.base, pack: { ...fallback.pack }, aliases: [], estimated: true };
}
