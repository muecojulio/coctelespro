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
- Elige uno o varios cócteles, el número de personas y vasos por persona; el menú se comparte con Fiesta.
- Cálculo de vasos, costo de ingredientes, ingreso de venta sugerido y ganancia bruta estimada, por cóctel y para todo el menú.
- Compras por cóctel a partir de sus ingredientes reales: cantidad usada, presentación de compra y costo de los envases completos.
- Cerveza con presentaciones habituales de 250, 330, 355, 473 y 710 ml; destilados, refrescos, jugos y mezcladores usan tamaños de compra propios.
- Editor de precios limitado por defecto a los ingredientes de las recetas seleccionadas; se pueden editar precios y presentaciones (se guardan en el dispositivo).
- Moneda en pesos mexicanos, dólares o euros (las conversiones son aproximadas).

## Estructura

```
app/                 Pantallas, componentes y rutas de API
  page.js            Estado y las cuatro pestañas
  components/        Componentes accesibles (tabs, combobox, rail…) y vistas de bebidas
lib/
  data/ingredients.js   Diccionario de insumos: nombre en español, presentación y precio
  data/recipes-local.js Catálogo local de 106 bebidas (español, sin conexión; recetas de referencia)
  drinks.js          Une catálogo local + API en un solo modelo
  i18n.js            Traducción de nombres, vasos, medidas e instrucciones al español
  pairing.js         Coincidencias entre tus ingredientes y las recetas
  costs.js           Costos, escalado por personas y lista de compras
  api-cache.js       Caché de las peticiones (memoria + localStorage)
scripts/check-data.mjs Revisión automática del catálogo y de los cálculos
```

## APIs e integraciones

1. **TheCocktailDB** — catálogo internacional, consultado con el identificador de desarrollo `1` y traducido al español en el navegador. Se conserva la búsqueda existente por nombre; la documentación oficial también describe búsquedas por letra e ingrediente, categorías, filtros y detalles.
2. **Open Brewery DB** — API pública sin clave; la ruta `/api/breweries` solicita cervecerías de referencia de México.
3. **SampleAPIs beers** — cervezas artesanales con precio de referencia convertido a MXN.
4. **Wikipedia REST (es)** — resumen de cada bebida.

Las integraciones nuevas no requieren variables de entorno ni claves. Si no hay conexión,
la app sigue funcionando con el catálogo local. El proyecto está configurado para desplegarse
como aplicación Next.js en Vercel.

## Fuentes externas y alcance

- [TheCocktailDB — documentación oficial](https://www.thecocktaildb.com/api.php): referencia de la API de cócteles existente.
- [Open Brewery DB — documentación](https://www.openbrewerydb.org/documentation): API pública utilizada para cervecerías de México.
- [public-api-lists/public-api-lists](https://github.com/public-api-lists/public-api-lists): referencia pública consultada para revisar APIs abiertas.
- [fabranx/Cocktails](https://github.com/fabranx/Cocktails): proyecto con licencia MIT consultado como referencia estructural; no se copió su catálogo de recetas.

Las recetas locales incluidas en `lib/data/recipes-local.js` son recetas de referencia para
el catálogo y los cálculos. Pueden variar según región, establecimiento o preferencia del
bartender. Las recetas internacionales de TheCocktailDB continúan cargándose desde su API;
no se incorporan como recetas locales por esa referencia.

## Precios

Los precios de los insumos son referencias de mercado en México y se pueden editar desde la
pestaña **Costos**. Lo editado se guarda solo en el dispositivo (`localStorage`).

## Privacidad

Pestaña **Privacidad** dentro de la app (política completa y actualizada ahí). Los datos
(ingredientes, favoritos, historial, precios y preferencias) no salen del dispositivo: no hay
cuentas, backend de usuarios, cookies de rastreo ni analíticas. Los códigos QR se generan en el
propio dispositivo y las tipografías están incluidas en la app (sin CDNs).

## Seguridad

- Dependencias auditadas (`npm audit`) sin vulnerabilidades conocidas.
- CSP estricta sin `unsafe-eval` en producción, más cabeceras HSTS, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` y `object-src 'none'`.
- Las rutas de API validan y limitan la entrada antes de consultar servicios externos.
