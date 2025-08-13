// src/components/Footer.tsx

// Estilos para reutilização
const footerStyle = {
  backgroundColor: '#343a40', // Cinza escuro
  color: '#f8f9fa', // Texto claro
  padding: '3rem 2rem',
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap' as const,
  gap: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const columnStyle = {
  flex: 1,
  minWidth: '200px',
};

const titleStyle = {
  fontSize: '1.1rem',
  marginBottom: '1rem',
  color: '#ffffff',
  borderBottom: '2px solid #008037', // Detalhe com o verde do IFPR
  paddingBottom: '0.5rem',
};

const linkStyle = {
  color: '#adb5bd',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '0.5rem',
};

const copyrightStyle = {
  textAlign: 'center' as const,
  marginTop: '3rem',
  paddingTop: '1rem',
  borderTop: '1px solid #495057',
  color: '#6c757d', // Cinza mais claro
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={columnStyle}>
          <h4 style={titleStyle}>Navegação</h4>
          <a href="/cursos" style={linkStyle}>Cursos</a>
          <a href="/sobre" style={linkStyle}>Sobre o Projeto</a>
          <a href="/login" style={linkStyle}>Login</a>
        </div>

        <div style={columnStyle}>
          <h4 style={titleStyle}>Contato</h4>
          <p style={{ color: '#adb5bd' }}>IFPR - Campus Foz do Iguaçu</p>
          <p style={{ color: '#adb5bd' }}>Av. Araucária, 780 - Vila A</p>
          <p style={{ color: '#adb5bd' }}>Foz do Iguaçu - PR</p>
        </div>

        <div style={columnStyle}>
          <h4 style={titleStyle}>Redes Sociais</h4>
          <a href="#" style={linkStyle}><i className="pi pi-facebook" style={{ marginRight: '8px' }}></i> Facebook</a>
          <a href="#" style={linkStyle}><i className="pi pi-instagram" style={{ marginRight: '8px' }}></i> Instagram</a>
          <a href="#" style={linkStyle}><i className="pi pi-youtube" style={{ marginRight: '8px' }}></i> YouTube</a>
        </div>
      </div>
      <div style={copyrightStyle}>
        &copy; {new Date().getFullYear()} MOOC IFPR. Todos os direitos reservados.
      </div>
    </footer>
  );
}