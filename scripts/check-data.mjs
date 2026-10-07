// Revisión rápida del catálogo: claves de insumos, medidas, ids y costos.
// Uso: npm run check:data

import { INGREDIENTS, getIngredient } from '../lib/data/ingredients.js';
import { LOCAL_RECIPES } from '../lib/data/recipes-local.js';
import { LOCAL_DRINKS, searchDrinks } from '../lib/drinks.js';
import { parseAmount, recipeCost, partyPlan, formatMoney } from '../lib/costs.js';
import { rankDrinks } from '../lib/pairing.js';

const problems = [];
const warnings = [];

// 1. Ingredientes usados por las recetas que no están en el diccionario.
const usedKeys = new Set();
LOCAL_RECIPES.forEach((recipe) => {
  recipe.ingredients.forEach(([key]) => usedKeys.add(key));
});
usedKeys.forEach((key) => {
  if (!INGREDIENTS[key]) problems.push(`Insumo sin ficha en el diccionario: ${key}`);
});

// 2. Ids duplicados y nombres repetidos.
const ids = new Set();
const names = new Set();
LOCAL_RECIPES.forEach((recipe) => {
  if (ids.has(recipe.id)) problems.push(`Id duplicado: ${recipe.id}`);
  ids.add(recipe.id);
  const normalized = recipe.name.toLocaleLowerCase('es');
  if (names.has(normalized)) warnings.push(`Nombre repetido: ${recipe.name}`);
  names.add(normalized);
});

// 3. Medidas que no se pueden interpretar.
LOCAL_RECIPES.forEach((recipe) => {
  recipe.ingredients.forEach(([key, measure]) => {
    const amount = parseAmount(measure);
    if (!Number.isFinite(amount.quantity) || amount.quantity <= 0) {
      problems.push(`Medida inválida en ${recipe.name}: ${key} — “${measure}”`);
    }
  });
});

// 4. Costos: sin NaN y con totales razonables.
LOCAL_DRINKS.forEach((drink) => {
  const cost = recipeCost(drink, {});
  if (!Number.isFinite(cost.perDrink)) problems.push(`Costo inválido en ${drink.name}`);
  if (cost.perDrink > 900) warnings.push(`Costo por bebida muy alto en ${drink.name}: ${formatMoney(cost.perDrink)}`);
  if (cost.perDrink <= 0 && drink.ingredients.length > 0) warnings.push(`Costo en cero en ${drink.name}`);
});

// 5. Coincidencias: una despensa típica debe encontrar bebidas.
const pantry = ['tequila', 'limón', 'sal', 'cerveza', 'clamato', 'salsa inglesa', 'salsa picante'];
const matches = rankDrinks(LOCAL_DRINKS, pantry);
if (!matches.length) problems.push('La despensa de prueba no encontró ninguna bebida');
const party = partyPlan([{ drink: LOCAL_DRINKS[0], perPerson: 2 }], 10, {});
if (party.drinksTotal !== 20) problems.push(`El plan de fiesta calculó mal los vasos: ${party.drinksTotal}`);
if (!party.shopping.length) problems.push('La lista de compras quedó vacía');

// 5b. El plan de fiesta debe reaccionar al número de personas y al menú.
const party20 = partyPlan([{ drink: LOCAL_DRINKS[0], perPerson: 2 }], 20, {});
if (party20.drinksTotal !== 2 * party.drinksTotal) problems.push('El plan de fiesta no escala con el número de personas');
if (Math.abs(party20.total - 2 * party.total) > 0.01) problems.push('El costo de la fiesta no escala con el número de personas');
const menuParty = partyPlan([
  { drink: LOCAL_DRINKS[0], perPerson: 2 },
  { drink: LOCAL_DRINKS.find((drink) => drink.name === 'Paloma'), perPerson: 1 },
], 10, {});
if (menuParty.items.length !== 2) problems.push('El menú de la fiesta no admite varias bebidas');
if (menuParty.shopping.length <= party.shopping.length) problems.push('La lista de compras no agrega los insumos del menú completo');

// 5c. Los precios editados deben cambiar el costo.
const baseCost = recipeCost(LOCAL_DRINKS.find((drink) => drink.name === 'Margarita'), {}).perDrink;
const cheapCost = recipeCost(LOCAL_DRINKS.find((drink) => drink.name === 'Margarita'), { Tequila: { size: 750, price: 120 } }).perDrink;
if (!(cheapCost < baseCost)) problems.push('Editar el precio de un insumo no cambia el costo calculado');

// 6. Búsqueda por texto.
if (!searchDrinks(LOCAL_DRINKS, 'margarita').length) problems.push('La búsqueda de “margarita” no devolvió resultados');
if (!searchDrinks(LOCAL_DRINKS, 'sin alcohol').length) problems.push('La búsqueda de “sin alcohol” no devolvió resultados');

const uniqueIngredients = new Set();
LOCAL_RECIPES.forEach((recipe) => recipe.ingredients.forEach(([key]) => uniqueIngredients.add(key)));

console.log('Cócteles Pro — revisión de datos');
console.log('─────────────────────────────────────────');
console.log(`Recetas locales:        ${LOCAL_RECIPES.length}`);
console.log(`Insumos en catálogo:    ${Object.keys(INGREDIENTS).length}`);
console.log(`Insumos usados:         ${uniqueIngredients.size}`);
console.log(`Bebidas sin alcohol:    ${LOCAL_DRINKS.filter((drink) => drink.type === 'sin-alcohol').length}`);
console.log(`Favoritas de prueba:    ${matches.length} coincidencias con la despensa de ejemplo`);
console.log(`Costo Michelada:        ${formatMoney(recipeCost(LOCAL_DRINKS[0], {}).perDrink)} por bebida`);
console.log(`Costo fiesta 10 pers.:  ${formatMoney(partyPlan([{ drink: LOCAL_DRINKS[0], perPerson: 2 }], 10, {}).total)}`);

if (warnings.length) {
  console.log('\nAvisos:');
  warnings.forEach((warning) => console.log(`  · ${warning}`));
}

if (problems.length) {
  console.error('\nErrores:');
  problems.forEach((problem) => console.error(`  ✗ ${problem}`));
  process.exit(1);
}

console.log('\nTodo correcto: insumos, medidas, costos y coincidencias funcionan.');
