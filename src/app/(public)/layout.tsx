// src/app/layout.tsx
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Importe seus componentes reais
import Header from '@/app/componentes/header';
import Footer from '@/app/componentes/footer';

export const metadata = {
  title: 'MOOC IFPR Foz do Iguaçu',
  description: 'Plataforma de Cursos Abertos do IFPR Foz do Iguaçu',
};

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: '100vh',
  margin: 0,
  backgroundColor: '#f8f9fa' // Uma cor de fundo suave para o site
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={bodyStyle}>
        <PrimeReactProvider>
          <Header />
          <main style={{ flex: 1, padding: '1rem' }}>
            {children}
          </main>
          <Footer />
        </PrimeReactProvider>
      </body>
    </html>
  );
}