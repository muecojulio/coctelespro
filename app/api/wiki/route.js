export const dynamic = 'force-dynamic';

// Devuelve el resumen de Wikipedia en español para una bebida.
// Si el título en español no existe, intenta con el nombre original
// (por ejemplo el nombre en inglés del catálogo internacional).

const MAX_TITLE_LENGTH = 120;

// Acepta letras (cualquier idioma), números, espacios y puntuación habitual de
// títulos; rechaza caracteres de control y símbolos raros para evitar abusos.
function sanitizeTitle(value) {
  const clean = String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!clean || clean.length > MAX_TITLE_LENGTH) return null;
  if (!/^[\p{L}\p{N} .,'&()+\-–—:!?¡¿%/]+$/u.test(clean)) return null;
  return clean;
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const candidates = [params.get('title'), params.get('fallback')]
    .map(sanitizeTitle)
    .filter(Boolean);

  if (!candidates.length) return Response.json({ error: 'missing_title' }, { status: 400 });

  for (const candidate of candidates.slice(0, 3)) {
    try {
      const url = new URL(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`);
      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'coctelespro/1.3 (https://github.com/muecojulio/coctelespro)' },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.type === 'disambiguation' || !data?.extract) continue;
      return Response.json(
        {
          title: data.title ?? candidate,
          extract: data.extract ?? null,
          url: data.content_urls?.desktop?.page ?? null,
        },
        { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
      );
    } catch {
      // Se intenta con el siguiente candidato.
    }
  }

  return Response.json({ extract: null, title: candidates[0] }, { status: 200 });
}
