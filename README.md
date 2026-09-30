# Cócteles Pro

App Next.js para recetas, ingredientes, fiestas y cálculo de costos.

## Requisitos

- Node.js **24.x** (`engines` en `package.json`)

```bash
npm install
npm run dev
```

## Índices de base de datos

**No aplica.** No hay PostgreSQL, MySQL ni SQLite. El estado es un JSON en `localStorage`. Un índice SQL no acelera esa clave única.

El rendimiento se resuelve con caché, no con índices locales.

## Caché

- Cliente: `lib/api-cache.js`
- Servidor: `app/api/breweries`, `app/api/beers`, `app/api/wiki`

## APIs

1. TheCocktailDB (existente)
2. Open Brewery DB (existente)
3. SampleAPIs beers (nueva, sin key)
4. Wikipedia REST (nueva, sin key)

## Privacidad

Ruta `/privacidad`. Datos de usuario no salen del dispositivo.
