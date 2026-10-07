# Cócteles Pro

App Next.js para buscar bebidas, guardar tus ingredientes, planear fiestas y calcular costos.
Todo funciona en español y **sin conexión** con el catálogo local de 106 bebidas; cuando hay
internet se suma el catálogo internacional (TheCocktailDB), traducido automáticamente al español.

## Requisitos

- Node.js **>= 20.9** (probado con Node 22 y Next.js 15).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
npm run start    # servidor de producción
npm run check:data   # revisa insumos, medidas, costos y coincidencias
```

## Pestañas

### 🍸 Inicio
- Búsqueda por nombre, ingrediente o estilo (cerveza, tequila, sin alcohol…).
- Filtros por categoría, favoritos y bebidas sin alcohol.
- Ficha completa de cada bebida: ingredientes con medidas en español, preparación,
  resumen de Wikipedia y precio de referencia.
- Favoritos (★) e historial reciente guardados en el dispositivo.

### 🍋 Ingredientes
- Lista de "mis ingredientes" con sugerencias mientras escribes.
- Cálculo inmediato de qué bebidas puedes preparar: coincidencias, porcentaje por bebida
  y lista de lo que falta, con un botón para añadirlo en un toque.
- Sugerencias de "si añades este ingrediente podrás preparar N bebidas más".
- Opción de asumir hielo y agua como básicos.

### 🎉 Fiesta
- Menú de hasta 6 bebidas con vasos por persona para cada una.
- Número de personas: los insumos, cantidades y costos se recalculan al instante.
- Lista de compras agregada con cantidades (ml, g, piezas) y el envase recomendado
  (latas, botellas, bolsas de hielo) más el costo estimado.
- Recomendación de hielo, costo total, costo por persona y resumen para compartir con QR.

### 💰 Costos
- Desglose del costo por ingrediente y por bebida.
- Costo de la tanda completa según el número de personas de la pestaña Fiesta.
- Precio de venta sugerido con el margen de ganancia que elijas.
- Editor de precios: presentación y precio de cada insumo (se guardan en el dispositivo).
- Moneda en pesos mexicanos, dólares o euros (las conversiones son aproximadas).

## Estructura

```
app/                 Pantallas, componentes y rutas de API
  page.js            Estado y las cuatro pestañas
  components/        Componentes accesibles (tabs, combobox, rail…) y vistas de bebidas
lib/
  data/ingredients.js   Diccionario de insumos: nombre en español, presentación y precio
  data/recipes-local.js Catálogo local de 106 bebidas (español, sin conexión)
  drinks.js          Une catálogo local + API en un solo modelo
  i18n.js            Traducción de nombres, vasos, medidas e instrucciones al español
  pairing.js         Coincidencias entre tus ingredientes y las recetas
  costs.js           Costos, escalado por personas y lista de compras
  api-cache.js       Caché de las peticiones (memoria + localStorage)
scripts/check-data.mjs Revisión automática del catálogo y de los cálculos
```

## APIs

1. TheCocktailDB — catálogo internacional (se traduce al español en el navegador).
2. Open Brewery DB — cervecerías de México.
3. SampleAPIs beers — cervezas artesanales con precio de referencia en MXN.
4. Wikipedia REST (es) — resumen de cada bebida.

No se requieren claves. Todas las rutas degradan con gracia: si no hay conexión la app
sigue funcionando con el catálogo local.

## Precios

Los precios de los insumos son referencias de mercado en México y se pueden editar desde la
pestaña **Costos**. Lo editado se guarda solo en el dispositivo (`localStorage`).

## Privacidad

Ruta `/privacidad`. Los datos (ingredientes, favoritos, historial, precios y preferencias)
no salen del dispositivo: no hay cuentas ni backend de usuarios.
