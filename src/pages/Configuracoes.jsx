import Sidebar from '../components/Sidebar';

export default function Configuracoes() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 'var(--space-8)', background: 'var(--color-bg)' }}>
        <h2 style={{ color: 'var(--text-navy)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Configurações</h2>
        <p style={{ color: 'var(--text-soft)', marginTop: 'var(--space-2)' }}>Módulo de configurações da clínica — em desenvolvimento.</p>
      </main>
    </div>
  );
}
