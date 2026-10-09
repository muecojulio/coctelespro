export const dynamic = 'force-dynamic';

// El catálogo de SampleAPIs publica precios en dólares; se convierten a pesos
// con un tipo de cambio aproximado solo para tener una referencia de compra.
const USD_TO_MXN = 18.5;

function parsePrice(value) {
  const number = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function GET() {
  try {
    const res = await fetch('https://api.sampleapis.com/beers/ale', {
      headers: { 'User-Agent': 'coctelespro/1.3' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return Response.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }
    const data = await res.json();
    const slim = Array.isArray(data)
      ? data.slice(0, 10).map((beer) => {
        const usd = parsePrice(beer.price);
        const mxn = usd ? Math.round(usd * USD_TO_MXN) : null;
        return {
          id: beer.id ?? beer.name,
          name: beer.name ?? 'Cerveza artesanal',
          price: mxn ? `≈ $${mxn} MXN` : 'Precio no disponible',
          priceMxn: mxn,
          rating: beer.rating?.average ?? null,
        };
      })
      : [];
    return Response.json(slim, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return Response.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
