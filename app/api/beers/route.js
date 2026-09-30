export const revalidate = 3600;

export async function GET() {
  const res = await fetch('https://api.sampleapis.com/beers/ale', {
    headers: { 'User-Agent': 'coctelespro/1.1' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return Response.json({ error: 'sampleapis_unavailable' }, { status: 502 });
  const data = await res.json();
  const slim = Array.isArray(data)
    ? data.slice(0, 12).map((b) => ({ id: b.id ?? null, name: b.name ?? null, price: b.price ?? null, rating: b.rating?.average ?? null }))
    : [];
  return Response.json(slim, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
