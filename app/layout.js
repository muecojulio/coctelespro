export const metadata = {
  title: 'Cócteles Pro - Calculadora de Bebidas',
  description: 'App para preparar cócteles con lo que tienes, calcular cantidades y costos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cócteles Pro',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0f0f1a' }}>
        {children}
        <footer style={{ textAlign: 'center', padding: '8px 12px 24px' }}>
          <a className="privacy-link" href="/privacidad">Política de privacidad</a>
        </footer>
      </body>
    </html>
  );
}
