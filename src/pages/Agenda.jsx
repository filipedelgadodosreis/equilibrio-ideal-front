import Sidebar from '../components/Sidebar';

export default function Agenda() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 'var(--space-8)', background: 'var(--color-bg)' }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          Agenda
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Módulo de agenda — em desenvolvimento.
        </p>
      </main>
    </div>
  );
}
