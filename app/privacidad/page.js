export const metadata = {
  title: 'Política de privacidad — Cócteles Pro',
  description: 'Cómo trata Cócteles Pro los datos en el dispositivo y las APIs públicas.',
};

export default function PrivacidadPage() {
  return (
    <main className="app-container" style={{ padding: 20, maxWidth: 720 }}>
      <h1 style={{ color: 'var(--accent, #e94560)', marginBottom: 12 }}>Política de privacidad</h1>
      <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Última actualización: 29 de septiembre de 2026</p>
      <section className="card">
        <h2 className="card-title">Responsable</h2>
        <p>Cócteles Pro opera de forma local en tu navegador.</p>
      </section>
      <section className="card">
        <h2 className="card-title">Datos que se guardan</h2>
        <p>Ingredientes, favoritos, historial, precios y preferencias viven solo en localStorage de este dispositivo. No hay cuenta ni backend de usuarios.</p>
      </section>
      <section className="card">
        <h2 className="card-title">APIs de terceros</h2>
        <p>TheCocktailDB, Open Brewery DB, SampleAPIs, Wikipedia REST y QR Server. Las consultas pueden revelar el nombre de la bebida al proveedor. No se envían precios ni ingredientes personales.</p>
      </section>
      <p style={{ marginTop: 16 }}><a href="/" style={{ color: 'var(--accent, #e94560)' }}>Volver a la app</a></p>
    </main>
  );
}
