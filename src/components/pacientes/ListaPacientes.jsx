import Sidebar from '../Sidebar';
import { dataDeIso } from '../../utils/horarios';

const FILTROS = [
  { key: 'todos',  label: 'Todos' },
  { key: 'conv',   label: 'Convênio' },
  { key: 'part',   label: 'Particular' },
  { key: 'ativo',  label: 'Ativos' },
];

function iniciais(nome = '') {
  return (nome.split(' ').map(w => w[0]).join('').slice(0, 2)).toUpperCase();
}

export function ListaPacientes({
  pacientes, isLoading, contagens = {},
  filtroStatus, onFiltroChange,
  busca, onBuscaChange,
  ordem, onOrdemChange, ordenacoes = [],
  onVerFicha, onEditarFicha, onNovoPaciente,
  selectedDate, onDateChange,
}) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sky-mist)', fontFamily: 'var(--font-lato)' }}>
      <Sidebar selectedDate={selectedDate} onDateChange={onDateChange} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          height: 56, background: '#fff', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--navy)', fontWeight: 600 }}>
            Pacientes
          </span>
          <div style={{ flex: 1 }} />

          {/* Busca */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--sky-light)', pointerEvents: 'none' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou CPF…"
              value={busca}
              onChange={e => onBuscaChange(e.target.value)}
              style={{
                width: 220, height: 32, padding: '0 10px 0 28px',
                border: '1.5px solid var(--border)', borderRadius: 8,
                fontFamily: 'var(--font-lato)', fontSize: 12,
                background: 'var(--sky-mist)', outline: 'none', color: 'var(--navy)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}
            />
          </div>

          <button
            onClick={onNovoPaciente}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: 8,
              background: 'var(--navy)', color: '#fff',
              fontFamily: 'var(--font-lato)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Novo Paciente
          </button>
        </div>

        {/* Filtros */}
        <div style={{
          height: 44, background: '#fff', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 6, flexShrink: 0,
        }}>
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => onFiltroChange(f.key)}
              style={{
                padding: '4px 13px',
                border: `1.5px solid ${filtroStatus === f.key ? 'var(--navy)' : 'var(--border)'}`,
                borderRadius: 18,
                background: filtroStatus === f.key ? 'var(--navy)' : '#fff',
                color: filtroStatus === f.key ? '#fff' : 'var(--text-soft)',
                fontFamily: 'var(--font-lato)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {f.label} ({contagens[f.key] ?? 0})
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Ordenação */}
          <div style={{ fontSize: 11, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Ordenar por
            <select
              value={ordem}
              onChange={e => onOrdemChange(e.target.value)}
              style={{
                border: '1.5px solid var(--border)', borderRadius: 7, padding: '3px 8px',
                fontFamily: 'var(--font-lato)', fontSize: 11, background: 'var(--sky-mist)',
                outline: 'none', color: 'var(--text)', height: 28, cursor: 'pointer',
              }}
            >
              {ordenacoes.map(o => (
                <option key={o.key} value={o.key} disabled={!o.disponivel}>
                  {o.label}{o.disponivel ? '' : ' (sem dado)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-soft)', fontSize: 13 }}>
              Carregando pacientes...
            </div>
          ) : pacientes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
              <div style={{ fontSize: 32 }}>👥</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Nenhum paciente encontrado</div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                {busca ? 'Tente uma busca diferente.' : 'Cadastre o primeiro paciente.'}
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--sky-mist)' }}>
                  {['Paciente', 'CPF', 'WhatsApp', 'Convênio', 'Status', 'Última consulta', 'Total consultas', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '9px 16px', textAlign: 'left',
                      fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
                      textTransform: 'uppercase', color: 'var(--text-soft)',
                      borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => onVerFicha(p)}
                    style={{ borderBottom: '1px solid rgba(212,232,242,.5)', cursor: 'pointer', transition: 'background .1s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--sky-pale)'}
                    onMouseOut={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'var(--sky-pale)', border: '1.5px solid var(--sky-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: 'var(--navy)', flexShrink: 0,
                        }}>
                          {iniciais(p.nome)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{p.nome}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 1 }}>{p.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--navy)' }}>
                      {p.cpf || '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--navy)' }}>
                      {p.whatsapp || '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: p.convenioNome ? 'var(--sky-pale)' : '#F2EFFA',
                        color: p.convenioNome ? '#1E6FA3' : '#6B52A8',
                        border: `1px solid ${p.convenioNome ? 'var(--sky-light)' : '#C4B5F4'}`,
                      }}>
                        {p.convenioNome || 'Particular'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: p.ativo ? 'var(--green-pale)' : '#F5F5F5',
                        color: p.ativo ? '#1A6A42' : '#999',
                        border: `1px solid ${p.ativo ? 'var(--green-bdr)' : '#DDD'}`,
                      }}>
                        {p.ativo ? '● Ativo' : '⊘ Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--navy)' }}>
                      {dataDeIso(p.ultimaConsulta) || '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--navy)' }}>
                      {p.totalConsultas ?? '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          onClick={e => { e.stopPropagation(); onEditarFicha(p); }}
                          title="Editar ficha"
                          style={{ width: 28, height: 28, border: '1.5px solid var(--border)', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✏️</button>
                        <button
                          onClick={e => { e.stopPropagation(); /* agendar */ }}
                          title="Agendar"
                          style={{ width: 28, height: 28, border: '1.5px solid var(--border)', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >📅</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
