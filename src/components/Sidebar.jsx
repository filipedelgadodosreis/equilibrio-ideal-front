import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { usuario, sair } = useAuth();

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-4) 0',
    }}>
      <div style={{ padding: '0 var(--space-4) var(--space-6)' }}>
        <span style={{ color: 'var(--color-text-inverse)', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
          Equilíbrio Ideal
        </span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {/* placeholder — links reais serão adicionados por módulo */}
        <NavItem to="/agenda" label="Agenda" />
        {usuario?.perfil === 'Admin' && <NavItem to="/usuarios" label="Usuários" />}
        {usuario?.perfil === 'Admin' && <NavItem to="/configuracoes" label="Configurações" />}
      </nav>

      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid #2C5F5F' }}>
        <div style={{ color: 'var(--sidebar-text)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
          {usuario?.nome}
        </div>
        <button
          onClick={sair}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #4A7F7F',
            color: 'var(--sidebar-text)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: 'var(--space-3) var(--space-4)',
        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
        textDecoration: 'none',
        fontSize: 'var(--font-size-sm)',
        fontWeight: isActive ? 600 : 400,
        transition: 'background var(--transition-fast)',
      })}
    >
      {label}
    </NavLink>
  );
}
