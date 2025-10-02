// src/app/(protected)/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <div>
      {/* O título da sua página */}
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      {/* Conteúdo de exemplo para o seu dashboard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        {/* Card de Exemplo 1 */}
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Cursos Ativos</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</p>
        </div>

        {/* Card de Exemplo 2 */}
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Novas Solicitações</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>5</p>
        </div>

        {/* Card de Exemplo 3 */}
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Alunos Inscritos</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>248</p>
        </div>
      </div>
    </div>
  );
}