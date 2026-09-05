import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentos, useProfissionais, useSalas } from '../hooks/useAgenda';
import { AgendaCard } from '../components/agenda/AgendaCard';
import { SlotDisponivel } from '../components/agenda/SlotDisponivel';
import { ModalAgendamento } from '../components/agenda/ModalAgendamento';
import { useAuth } from '../context/AuthContext';
import { horaDeIso } from '../utils/horarios';
import Sidebar from '../components/Sidebar';

const HORARIOS = [];
for (let h = 8; h < 21; h++) {
  HORARIOS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) HORARIOS.push(`${String(h).padStart(2, '0')}:30`);
}

const ESPECIALIDADES = [
  { value: 'Psicologia',     label: 'Psicologia',     cls: 'psico', ini: 'Psi' },
  { value: 'Nutricao',       label: 'Nutrição',        cls: 'nutri', ini: 'Nut' },
  { value: 'Fonoaudiologia', label: 'Fonoaudiologia',  cls: 'fono',  ini: 'Fon' },
];

const ESP_STYLE = {
  psico: { bg: 'var(--psico-bg)', border: 'var(--psico)', color: 'var(--psico-txt)' },
  nutri: { bg: 'var(--nutri-bg)', border: 'var(--nutri)', color: 'var(--nutri-txt)' },
  fono:  { bg: 'var(--fono-bg)',  border: 'var(--fono)',  color: 'var(--fono-txt)'  },
};

// ── Dropdown de filtro ───────────────────────────────────────────────────────
function FilterDropdown({ icon, label, options, value, onApply, withSearch = false }) {
  const [open, setOpen]     = useState(false);
  const [draft, setDraft]   = useState(value);
  const [query, setQuery]   = useState('');
  const ref                 = useRef(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const hasVal = !!value;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         5,
          padding:     '5px 11px',
          border:      `1.5px solid ${hasVal || open ? 'var(--sky)' : 'var(--border)'}`,
          borderRadius: 7,
          background:  hasVal || open ? 'var(--sky-pale)' : '#fff',
          color:       hasVal ? 'var(--navy)' : 'var(--text-soft)',
          cursor:      'pointer',
          fontSize:    11,
          fontWeight:  700,
          fontFamily:  'var(--font-lato)',
          whiteSpace:  'nowrap',
          transition:  'all .15s',
        }}
      >
        {icon} {label}
        {hasVal && (
          <span style={{
            background: 'var(--sky)', color: '#fff',
            width: 15, height: 15, borderRadius: '50%',
            fontSize: 8.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>1</span>
        )}
        <span style={{ fontSize: 9, color: 'var(--text-soft)', transition: 'transform .18s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position:    'absolute',
          top:         'calc(100% + 4px)',
          left:        0,
          zIndex:      100,
          background:  '#fff',
          border:      '1.5px solid var(--border)',
          borderRadius: 10,
          boxShadow:   '0 8px 28px rgba(27,58,92,.13)',
          minWidth:    230,
          padding:     10,
          animation:   'ddIn .15s ease',
        }}>
          {withSearch && (
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--sky-light)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                autoFocus
                type="text"
                placeholder={`Buscar ${label.toLowerCase()}…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%', height: 30, padding: '0 8px 0 26px',
                  border: '1.5px solid var(--border)', borderRadius: 6,
                  fontFamily: 'var(--font-lato)', fontSize: 11,
                  background: 'var(--sky-mist)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filtered.map(opt => {
              const espStyle = ESP_STYLE[opt.cls];
              return (
                <div
                  key={opt.value}
                  onClick={() => setDraft(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 6px', borderRadius: 6, cursor: 'pointer',
                    background: draft === opt.value ? 'var(--sky-mist)' : 'transparent',
                    transition: 'background .12s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--sky-mist)'}
                  onMouseOut={e => e.currentTarget.style.background = draft === opt.value ? 'var(--sky-mist)' : 'transparent'}
                >
                  {opt.ini && espStyle && (
                    <div style={{
                      width: 23, height: 23, borderRadius: '50%',
                      background: espStyle.bg, color: espStyle.color,
                      fontSize: 8.5, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{opt.ini}</div>
                  )}
                  <input
                    type="radio"
                    checked={draft === opt.value}
                    onChange={() => setDraft(opt.value)}
                    style={{ accentColor: 'var(--sky)', width: 13, height: 13, flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 11, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: 9, color: 'var(--text-soft)' }}>{opt.sub}</div>}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-soft)', padding: '8px 6px', textAlign: 'center' }}>Nenhum resultado</div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => { setDraft(null); onApply(null); setOpen(false); }} style={{ fontSize: 11, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: '2px 4px' }}>Limpar</button>
            <button onClick={() => { onApply(draft); setOpen(false); }} style={{ fontSize: 11, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--navy)', padding: '2px 4px' }}>Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chip de filtro ativo ─────────────────────────────────────────────────────
function FilterChip({ label, cls, onRemove }) {
  const styles = {
    psico: { background: 'var(--psico-bg)', border: 'var(--psico)', color: 'var(--psico-txt)' },
    nutri: { background: 'var(--nutri-bg)', border: 'var(--nutri)', color: 'var(--nutri-txt)' },
    fono:  { background: 'var(--fono-bg)',  border: 'var(--fono)',  color: 'var(--fono-txt)'  },
    prof:  { background: 'var(--sky-pale)', border: 'var(--sky)',   color: 'var(--navy)'      },
    sala:  { background: '#F0EBF8',         border: '#9B8EC4',      color: '#6B52A8'           },
  };
  const s = styles[cls] || styles.prof;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 18,
      fontSize: 10, fontWeight: 700,
      background: s.background, border: `1.5px solid ${s.border}`, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {label}
      <span onClick={onRemove} style={{ cursor: 'pointer', opacity: .7, fontSize: 10, marginLeft: 2 }}>✕</span>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function Agenda() {
  const { usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData]         = useState(new Date());
  const [modoDisp, setModoDisp] = useState(false);
  const [modalAberto, setModalAberto]     = useState(false);
  const [contextoModal, setContextoModal] = useState(null);

  const [filtroEsp,  setFiltroEsp]  = useState(null);
  const [filtroProf, setFiltroProf] = useState(null);
  const [filtroSala, setFiltroSala] = useState(null);
  const [busca, setBusca]           = useState('');

  const isProfissional = usuario?.perfil === 'Profissional';

  const queryFiltros = isProfissional
    ? { profissionalId: usuario.profissionalId }
    : { especialidade: filtroEsp };

  const { data: agendamentos = [], isLoading } = useAgendamentos(data, queryFiltros);
  const { data: todosProfs   = [] }            = useProfissionais(filtroEsp);
  const { data: salas        = [] }            = useSalas();

  const profissionais = (() => {
    let list = todosProfs;
    if (filtroProf) list = list.filter(p => p.id === filtroProf);
    if (busca)      list = list.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase()));
    return list;
  })();

  const agendamentosFiltrados = filtroSala
    ? agendamentos.filter(a => a.salaId === filtroSala)
    : agendamentos;

  function getAgendamento(profId, hora) {
    return agendamentosFiltrados.find(a =>
      a.profissionalId === profId &&
      horaDeIso(a.dataHora) === hora
    );
  }

  function abrirModal(contexto = null) {
    setContextoModal(contexto);
    setModalAberto(true);
  }

  // Paciente vindo da ficha ("Agendar consulta"): abre o modal já com ele.
  // Limpa o state em seguida para que um refresh não reabra o modal.
  useEffect(() => {
    const { pacienteId, pacienteNome } = location.state || {};
    if (!pacienteId) return;
    setContextoModal({ pacienteId, pacienteNome });
    setModalAberto(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const opcoesProf = todosProfs.map(p => ({
    value: p.id,
    label: p.nome,
    sub:   `${p.especialidade} · ${p.sala || ''}`,
  }));
  const opcoesSala = salas.map(s => ({
    value: s.id,
    label: s.nome || s.identificacao || `Sala ${s.numero ?? s.id}`,
  }));
  const profSelecionado = todosProfs.find(p => p.id === filtroProf);
  const salaSelecionada = salas.find(s => s.id === filtroSala);

  const temChips = !!(filtroEsp || filtroProf || filtroSala);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sky-mist)', fontFamily: 'var(--font-lato)', fontSize: 13 }}>
      <Sidebar selectedDate={data} onDateChange={setData} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Header ── */}
        <div style={{
          height:       56,
          background:   '#fff',
          borderBottom: '1px solid var(--border)',
          display:      'flex',
          alignItems:   'center',
          padding:      '0 16px',
          gap:          10,
          flexShrink:   0,
        }}>
          <button onClick={() => setData(new Date())} style={btnToday}>Hoje</button>
          <div style={{ display: 'flex', gap: 2 }}>
            <button onClick={() => setData(d => subDays(d, 1))} style={btnNav}>‹</button>
            <button onClick={() => setData(d => addDays(d, 1))} style={btnNav}>›</button>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
            {format(data, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div style={{ flex: 1 }} />

          {/* Banner disponibilidade */}
          {modoDisp && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 14px 5px 10px',
              background: 'var(--avail)', border: '1.5px solid var(--avail-bdr)',
              borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'var(--avail-txt)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--avail-bdr)',
                display: 'inline-block',
                animation: 'pulse 1.5s ease infinite',
              }} />
              Modo disponibilidade ativo
            </div>
          )}

          {/* Toggle Dia/Semana */}
          <div style={{
            display: 'flex', background: 'var(--sky-mist)',
            border: '1.5px solid var(--border)', borderRadius: 7, padding: 3, gap: 2,
          }}>
            {['Dia', 'Semana'].map(v => (
              <button key={v} style={{
                padding: '4px 11px', border: 'none',
                borderRadius: 5, cursor: 'pointer',
                fontFamily: 'var(--font-lato)', fontSize: 11, fontWeight: 700,
                background: v === 'Dia' ? '#fff' : 'transparent',
                color: v === 'Dia' ? 'var(--navy)' : 'var(--text-soft)',
                boxShadow: v === 'Dia' ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s',
              }}>
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => abrirModal()}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', border: 'none', borderRadius: 7,
              background: 'var(--navy)', color: '#fff',
              cursor: 'pointer', fontFamily: 'var(--font-lato)',
              fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
            }}
          >
            + Novo Agendamento
          </button>
        </div>

        {/* ── Filter bar ── */}
        {!isProfissional && (
          <div style={{
            height:       48,
            background:   '#fff',
            borderBottom: '1px solid var(--border)',
            display:      'flex',
            alignItems:   'center',
            padding:      '0 16px',
            gap:          8,
            flexShrink:   0,
            position:     'relative',
            zIndex:       40,
            overflow:     'visible',
          }}>
            {/* Chips ativos */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {filtroEsp && (
                <FilterChip
                  label={ESPECIALIDADES.find(e => e.value === filtroEsp)?.label}
                  cls={ESPECIALIDADES.find(e => e.value === filtroEsp)?.cls}
                  onRemove={() => { setFiltroEsp(null); setFiltroProf(null); }}
                />
              )}
              {filtroProf && profSelecionado && (
                <FilterChip
                  label={profSelecionado.nome?.split(' ').slice(0, 2).join(' ')}
                  cls="prof"
                  onRemove={() => setFiltroProf(null)}
                />
              )}
              {filtroSala && salaSelecionada && (
                <FilterChip
                  label={salaSelecionada.nome || salaSelecionada.identificacao}
                  cls="sala"
                  onRemove={() => setFiltroSala(null)}
                />
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* Toggle disponíveis */}
            <div
              onClick={() => setModoDisp(m => !m)}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         7,
                padding:     '5px 12px',
                border:      `1.5px solid ${modoDisp ? 'var(--avail-bdr)' : 'var(--border)'}`,
                borderRadius: 20,
                cursor:      'pointer',
                fontSize:    11,
                fontWeight:  700,
                color:       modoDisp ? 'var(--avail-txt)' : 'var(--text-soft)',
                background:  modoDisp ? 'var(--avail)' : '#fff',
                userSelect:  'none',
                transition:  'all .2s',
                whiteSpace:  'nowrap',
              }}
            >
              {/* Switch visual */}
              <div style={{
                width: 26, height: 15, borderRadius: 8,
                background: modoDisp ? 'var(--avail-bdr)' : 'var(--border)',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 2,
                  left: modoDisp ? 13 : 2,
                  width: 11, height: 11,
                  borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  transition: 'left .2s',
                }} />
              </div>
              Disponíveis
            </div>

            {/* Dropdowns */}
            <div style={{ display: 'flex', gap: 5 }}>
              <FilterDropdown
                icon="🧠"
                label="Especialidade"
                options={ESPECIALIDADES}
                value={filtroEsp}
                onApply={v => { setFiltroEsp(v); setFiltroProf(null); }}
              />
              <FilterDropdown
                icon="👤"
                label="Terapeuta"
                options={opcoesProf}
                value={filtroProf}
                onApply={setFiltroProf}
                withSearch
              />
              <FilterDropdown
                icon="🏥"
                label="Sala"
                options={opcoesSala}
                value={filtroSala}
                onApply={setFiltroSala}
                withSearch
              />
            </div>

            {/* Busca */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--sky-light)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Buscar profissional…"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={{
                  width: 170, height: 30,
                  padding: '0 10px 0 27px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 7,
                  background: 'var(--sky-mist)',
                  fontFamily: 'var(--font-lato)', fontSize: 11,
                  color: 'var(--text)', outline: 'none',
                  transition: 'all .15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}
              />
            </div>
          </div>
        )}

        {/* ── Grade ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-soft)', fontSize: 13 }}>
              Carregando agenda...
            </div>
          ) : profissionais.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-soft)', fontSize: 13 }}>
              Nenhum profissional encontrado.
            </div>
          ) : (
            <>
              {/* Pills rápidas de especialidade (fora do scroll) */}
              {!isProfissional && (
                <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid rgba(212,232,242,.6)', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px' }}>
                  {[{ value: null, label: 'Todos' }, ...ESPECIALIDADES].map(e => {
                    const ativo = filtroEsp === e.value;
                    const st    = e.cls ? ESP_STYLE[e.cls] : null;
                    return (
                      <button
                        key={e.label}
                        onClick={() => { setFiltroEsp(e.value); setFiltroProf(null); }}
                        style={{
                          display:      'flex',
                          alignItems:   'center',
                          gap:          4,
                          padding:      '3px 10px',
                          borderRadius: 18,
                          border:       `1.5px solid ${ativo ? (st?.border || 'var(--navy)') : 'var(--border)'}`,
                          background:   ativo ? (st?.bg || 'var(--sky-pale)') : '#fff',
                          color:        ativo ? (st?.color || 'var(--navy)') : 'var(--text-soft)',
                          cursor:       'pointer',
                          fontSize:     10,
                          fontWeight:   700,
                          fontFamily:   'var(--font-lato)',
                          transition:   'all .15s',
                        }}
                      >
                        {st && <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.border, display: 'inline-block' }} />}
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Scroll container único — sincroniza horas + colunas */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <div style={{ minWidth: `${54 + profissionais.length * 152}px` }}>

                  {/* Cabeçalhos sticky */}
                  <div style={{
                    display:      'flex',
                    position:     'sticky',
                    top:          0,
                    zIndex:       10,
                    background:   '#fff',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ width: 54, flexShrink: 0, borderRight: '1px solid var(--border)' }} />
                    {profissionais.map(prof => {
                      const esp = ESPECIALIDADES.find(e => e.value === prof.especialidade);
                      const st  = ESP_STYLE[esp?.cls] || ESP_STYLE.psico;
                      return (
                        <div key={prof.id} style={{
                          width: 152, minWidth: 152,
                          height: 56, padding: '8px 10px',
                          borderRight: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: st.bg, color: st.color,
                            fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {(prof.nome || '').split(' ').slice(0, 2).map(p => p[0]).join('')}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prof.nome}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.border, flexShrink: 0, display: 'inline-block' }} />
                              {prof.especialidade}{prof.sala ? ` · ${prof.sala}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Corpo da grade */}
                  <div style={{ display: 'flex' }}>
                    {/* Calha de horas (dentro do scroll — sincroniza verticalmente) */}
                    <div style={{ width: 54, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border)' }}>
                      {HORARIOS.map(hora => (
                        <div key={hora} style={{
                          height: 56, display: 'flex', alignItems: 'flex-start',
                          justifyContent: 'flex-end', padding: '4px 6px 0 0',
                          fontSize: 9.5, color: 'var(--text-soft)',
                        }}>
                          {hora.endsWith(':00') ? hora : ''}
                        </div>
                      ))}
                    </div>

                    {/* Colunas dos profissionais */}
                    {profissionais.map(prof => (
                      <div key={prof.id} style={{
                        width: 152, minWidth: 152,
                        borderRight: '1px solid var(--border)',
                        position: 'relative',
                      }}>
                        {HORARIOS.map(hora => {
                          const agend = getAgendamento(prof.id, hora);
                          return (
                            <div key={hora} style={{
                              height:       56,
                              borderBottom: '1px solid rgba(212,232,242,.45)',
                              cursor:       'pointer',
                              position:     'relative',
                              transition:   'background .15s',
                            }}
                              onMouseOver={e => { if (!agend) e.currentTarget.style.background = 'rgba(125,168,201,.05)'; }}
                              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {agend ? (
                                <div style={{ position: 'absolute', left: 3, right: 3, top: 2 }}>
                                  <AgendaCard agendamento={agend} onClick={() => abrirModal({ agendamento: agend })} />
                                </div>
                              ) : modoDisp ? (
                                <SlotDisponivel hora={hora} onClick={() => abrirModal({ profissional: prof, hora, data })} />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ModalAgendamento
        aberto={modalAberto}
        onFechar={() => { setModalAberto(false); setContextoModal(null); }}
        contextoInicial={contextoModal}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
        @keyframes ddIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

const btnToday = {
  padding:     '5px 11px',
  border:      '1.5px solid var(--border)',
  borderRadius: 7,
  background:  '#fff',
  cursor:      'pointer',
  fontFamily:  'var(--font-lato)',
  fontSize:    11,
  fontWeight:  700,
  color:       'var(--navy)',
};

const btnNav = {
  width:       27,
  height:      27,
  border:      '1.5px solid var(--border)',
  background:  '#fff',
  borderRadius: 6,
  cursor:      'pointer',
  fontSize:    13,
  color:       'var(--text-soft)',
  display:     'flex',
  alignItems:  'center',
  justifyContent: 'center',
};
