export const dynamic = 'force-dynamic';

export async function GET(request) {
  const title = new URL(request.url).searchParams.get('title') || '';
  if (!title.trim()) return Response.json({ error: 'missing_title' }, { status: 400 });
  const url = new URL('https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.trim()));
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'coctelespro/1.1 (https://github.com/muecojulio/coctelespro)' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return Response.json({ extract: null, title: title.trim() }, { status: 200 });
  const data = await res.json();
  return Response.json(
    { title: data.title ?? title.trim(), extract: data.extract ?? null, content_urls: data.content_urls?.desktop?.page ?? null },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
