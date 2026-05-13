import { useAuth } from '../context/AuthContext';

export default function AppPaciente() {
  const { usuario, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-4)',
    }}>
      <h2 style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
        Olá, {usuario?.nome}!
      </h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Área do Paciente — em desenvolvimento.
      </p>
      <button
        onClick={logout}
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-6)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        Sair
      </button>
    </div>
  );
}
