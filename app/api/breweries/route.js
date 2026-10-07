export const dynamic = 'force-dynamic';

const CITY_LABELS = {
  'mexico city': 'Ciudad de México',
  'ciudad de mexico': 'Ciudad de México',
  guadalajara: 'Guadalajara',
  monterrey: 'Monterrey',
  puebla: 'Puebla',
  tijuana: 'Tijuana',
  merida: 'Mérida',
  'mérida': 'Mérida',
  queretaro: 'Querétaro',
  'querétaro': 'Querétaro',
  'san miguel de allende': 'San Miguel de Allende',
  'playa del carmen': 'Playa del Carmen',
  cancun: 'Cancún',
  'cancún': 'Cancún',
  oaxaca: 'Oaxaca',
  'valle de guadalupe': 'Valle de Guadalupe',
  leon: 'León',
  'león': 'León',
  toluca: 'Toluca',
  'mexico': 'México',
};

const TYPE_LABELS = {
  micro: 'Microcervecería',
  nano: 'Nano cervecería',
  regional: 'Cervecería regional',
  brewpub: 'Cervecería con bar',
  large: 'Cervecería grande',
  planning: 'En proyecto',
  contract: 'Producción por contrato',
  proprietor: 'Cervecería independiente',
  closed: 'Cerrada',
};

function translateCity(value) {
  if (!value) return '';
  const key = String(value).trim().toLocaleLowerCase('es');
  return CITY_LABELS[key] || String(value).trim();
}

export async function GET() {
  try {
    const url = new URL('https://api.openbrewerydb.org/v1/breweries');
    url.searchParams.set('per_page', '10');
    url.searchParams.set('by_country', 'Mexico');
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'coctelespro/1.2' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return Response.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }
    const data = await res.json();
    const list = Array.isArray(data)
      ? data.map((item) => ({
        id: item.id ?? item.name,
        name: item.name ?? 'Cervecería',
        city: translateCity(item.city),
        state: translateCity(item.state_province),
        type: TYPE_LABELS[String(item.brewery_type || '').toLocaleLowerCase('en')] || 'Cervecería',
        website: item.website_url || null,
      }))
      : [];
    return Response.json(list, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return Response.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
