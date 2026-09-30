export const revalidate = 3600;

export async function GET() {
  const url = new URL('https://api.openbrewerydb.org/v1/breweries');
  url.searchParams.set('per_page', '8');
  url.searchParams.set('by_country', 'Mexico');
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'coctelespro/1.1' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return Response.json({ error: 'brewery_api_unavailable' }, { status: 502 });
  const data = await res.json();
  return Response.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
