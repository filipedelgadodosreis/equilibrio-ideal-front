import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SH = ['D','S','T','Q','Q','S','S'];

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { to: '/agenda',        icon: '📅', label: 'Agenda' },
      { to: '/pacientes',     icon: '👥', label: 'Pacientes' },
      { to: '/painel-senhas', icon: '🔢', label: 'Painel de Senhas' },
    ],
  },
  {
    label: 'Admin',
    perfis: ['Admin'],
    items: [
      { to: '/faturamento',      icon: '💰', label: 'Faturamento' },
      { to: '/relatorio-agenda', icon: '📊', label: 'Relatório da Agenda' },
      { to: '/auditoria',        icon: '🔍', label: 'Auditoria' },
    ],
  },
  {
    label: 'Clínica',
    items: [
      { to: '/profissionais', icon: '🧠', label: 'Profissionais' },
      { to: '/salas',         icon: '🏥', label: 'Salas' },
    ],
  },
  {
    label: 'Sistema',
    perfis: ['Admin'],
    items: [
      { to: '/configuracoes', icon: '⚙️', label: 'Configurações' },
    ],
  },
];

function iniciais(nome = '') {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── Mini calendário ──────────────────────────────────────────────────────────
function MiniCal({ selectedDate, onDateChange }) {
  const today = new Date();
  const sel   = selectedDate || today;

  const [mesVis, setMesVis] = useState(() => new Date(sel.getFullYear(), sel.getMonth(), 1));

  const ano  = mesVis.getFullYear();
  const mes  = mesVis.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();   // 0=Dom
  const totalDias   = new Date(ano, mes + 1, 0).getDate();

  function navMes(dir) {
    setMesVis(d => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  function isHoje(d)  { return today.getDate() === d && today.getMonth() === mes && today.getFullYear() === ano; }
  function isSel(d)   { return sel.getDate()   === d && sel.getMonth()   === mes && sel.getFullYear()   === ano; }

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= totalDias; d++) cells.push(d);

  return (
    <div style={{ padding: '11px 13px', borderBottom: '1px solid var(--border)' }}>
      {/* cabeçalho do mês */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>
          {MESES[mes]} {ano}
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          {['‹', '›'].map((arrow, i) => (
            <button
              key={arrow}
              onClick={() => navMes(i === 0 ? -1 : 1)}
              style={{
                width: 19, height: 19, border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--text-soft)', borderRadius: 4,
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--sky-pale)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>

      {/* letras dos dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 2 }}>
        {DIAS_SH.map((d, i) => (
          <span key={i} style={{ fontSize: 8, color: 'var(--text-soft)', fontWeight: 700 }}>{d}</span>
        ))}
      </div>

      {/* dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;

          const hoje = isHoje(d);
          const selecionado = isSel(d);

          return (
            <div
              key={d}
              onClick={() => onDateChange?.(new Date(ano, mes, d))}
              style={{
                aspectRatio:    '1',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       10,
                borderRadius:   '50%',
                cursor:         'pointer',
                background:     hoje ? 'var(--navy)' : selecionado ? 'var(--sky)' : 'transparent',
                color:          hoje || selecionado ? '#fff' : 'var(--text)',
                fontWeight:     hoje ? 700 : 400,
                transition:     'background .1s',
              }}
              onMouseOver={e => { if (!hoje && !selecionado) e.currentTarget.style.background = 'var(--sky-pale)'; }}
              onMouseOut={e  => { if (!hoje && !selecionado) e.currentTarget.style.background = 'transparent'; }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ selectedDate, onDateChange }) {
  const { usuario, logout } = useAuth();
  const perfil = usuario?.perfil;

  return (
    <aside style={{
      width:        208,
      minHeight:    '100vh',
      background:   '#fff',
      borderRight:  '1px solid var(--border)',
      display:      'flex',
      flexDirection:'column',
      flexShrink:   0,
      fontFamily:   'var(--font-lato)',
    }}>

      {/* ── Brand ── */}
      <div style={{
        padding:      '13px 14px 11px',
        borderBottom: '1px solid var(--border)',
        display:      'flex',
        alignItems:   'center',
        gap:          9,
      }}>
        <div style={{
          width: 31, height: 31, background: 'var(--navy)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontFamily: 'var(--font-serif)' }}>Ψ</span>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>Equilíbrio Ideal</div>
          <div style={{ fontSize: 10, color: 'var(--text-soft)' }}>Clínica Multidisciplinar</div>
        </div>
      </div>

      {/* ── Mini calendário ── */}
      <MiniCal selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* ── Nav ── */}
      <nav style={{ padding: '9px 7px', flex: 1, overflowY: 'auto' }}>
        {NAV_SECTIONS.map(section => {
          if (section.perfis && !section.perfis.includes(perfil)) return null;
          return (
            <div key={section.label} style={{ marginBottom: 2 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '.14em',
                textTransform: 'uppercase', color: 'var(--text-soft)',
                padding: '6px 6px 3px', marginTop: 4,
              }}>
                {section.label}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 9px', borderRadius: 7, cursor: 'pointer',
                    color: isActive ? 'var(--navy)' : 'var(--text-soft)',
                    background: isActive ? 'var(--sky-pale)' : 'transparent',
                    fontWeight: isActive ? 700 : 400,
                    fontSize: 12, textDecoration: 'none', marginBottom: 1,
                    transition: 'all .15s',
                  })}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: '10px 13px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--sky-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: 'var(--navy)', flexShrink: 0,
        }}>
          {iniciais(usuario?.nome)}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {usuario?.nome}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-soft)' }}>{perfil}</div>
        </div>
        <button onClick={logout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: 14, padding: 2 }}>
          ↩
        </button>
      </div>
    </aside>
  );
}
