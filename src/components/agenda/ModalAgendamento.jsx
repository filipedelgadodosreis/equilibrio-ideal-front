import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProfissionais, useSalas, useDisponibilidade, useCriarAgendamento } from '../../hooks/useAgenda';
import { pacientesApi } from '../../api/pacientes';
import { horaDeIso } from '../../utils/horarios';

const HORARIOS = [];
for (let h = 8; h < 21; h++) {
  HORARIOS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) HORARIOS.push(`${String(h).padStart(2, '0')}:30`);
}

const ESPECIALIDADES = ['Psicologia', 'Nutricao', 'Fonoaudiologia'];
const DURACOES = [
  { label: '30 min', value: 30 },
  { label: '50 min', value: 50 },
  { label: '1 hora', value: 60 },
];

const PASSOS = ['Paciente', 'Consulta', 'Confirmar'];

export function ModalAgendamento({ aberto, onFechar, contextoInicial = null }) {
  const [passo, setPasso]     = useState(1);
  const [paciente, setPaciente] = useState(null);
  const [busca, setBusca]     = useState('');
  const [buscaQuery, setBuscaQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const [esp, setEsp]         = useState('Psicologia');
  const [profId, setProfId]   = useState(null);
  const [salaId, setSalaId]   = useState(null);
  const [data, setData]       = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [horario, setHorario] = useState(null);
  const [duracao, setDuracao] = useState(50);

  const [toast, setToast]     = useState(null);
  const [erro, setErro]       = useState('');

  const { data: profs = [] }  = useProfissionais(esp);
  const { data: salas = [] }  = useSalas();
  const { data: slots }       = useDisponibilidade(profId, new Date(data + 'T12:00:00'));
  const criar                 = useCriarAgendamento();

  // Aplica contexto inicial (ao clicar num slot)
  useEffect(() => {
    if (!contextoInicial) return;
    if (contextoInicial.profissional) {
      setProfId(contextoInicial.profissional.id);
      setEsp(contextoInicial.profissional.especialidade || 'Psicologia');
    }
    if (contextoInicial.hora)  setHorario(contextoInicial.hora);
    if (contextoInicial.data)  setData(format(contextoInicial.data, 'yyyy-MM-dd'));
  }, [contextoInicial]);

  // Paciente vindo da ficha: busca a ficha completa, pois o POST precisa do
  // convenioId. Só pula para o passo 2 com a ficha em mãos; se a busca falhar,
  // fica no passo 1 com o nome preenchido para a recepção reselecionar.
  useEffect(() => {
    const id = contextoInicial?.pacienteId;
    if (!id) return;

    let cancelado = false;
    setBusca(contextoInicial.pacienteNome || '');

    pacientesApi.obter(id)
      .then(res => {
        if (cancelado) return;
        const ficha = res.data;
        if (!ficha?.id) throw new Error('ficha vazia');
        setPaciente(ficha);
        setBusca(ficha.nome || contextoInicial.pacienteNome || '');
        setResultados([]);
        setPasso(2);
      })
      .catch(() => {
        if (cancelado) return;
        setPaciente(null);
        setPasso(1);
      });

    return () => { cancelado = true; };
  }, [contextoInicial]);

  // Debounce da busca de pacientes
  useEffect(() => {
    const t = setTimeout(() => setBuscaQuery(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    if (!buscaQuery.trim()) { setResultados([]); return; }
    setBuscando(true);
    pacientesApi.listar({ busca: buscaQuery })
      .then(res => setResultados(res.data ?? []))
      .catch(() => setResultados([]))
      .finally(() => setBuscando(false));
  }, [buscaQuery]);

  function fechar() {
    setPasso(1);
    setPaciente(null);
    setBusca('');
    setBuscaQuery('');
    setResultados([]);
    setProfId(null);
    setSalaId(null);
    setHorario(null);
    setData(format(new Date(), 'yyyy-MM-dd'));
    setErro('');
    onFechar();
  }

  async function confirmar() {
    setErro('');
    try {
      const dataHora = `${data}T${horario}:00`;
      await criar.mutateAsync({
        pacienteId:     paciente.id,
        profissionalId: profId,
        salaId:         salaId || null,
        convenioId:     paciente.convenioId || null,
        dataHora,
        duracaoMinutos: duracao,
      });
      setToast('Agendamento criado com sucesso!');
      setTimeout(() => { setToast(null); fechar(); }, 1800);
    } catch {
      setErro('Erro ao criar agendamento. Tente novamente.');
    }
  }

  function podeProsseguir() {
    if (passo === 1) return !!paciente;
    if (passo === 2) return !!profId && !!horario;
    return true;
  }

  const profSelecionado = profs.find(p => p.id === profId);
  const salaSelecionada = salas.find(s => s.id === salaId);

  // Slots disponíveis: a API devolve objetos { inicio, fim } em ISO (ver
  // horaDeIso para a convenção de fuso). Entradas ilegíveis viram '' em vez de
  // serem descartadas, para não encolher o array e cair no fallback de
  // length === 0, que liberaria todos os horários.
  const horariosDisponiveis = slots
    ? Array.isArray(slots)
      ? slots.map(s => typeof s === 'string' ? s : horaDeIso(s.inicio))
      : []
    : null;

  if (!aberto) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={fechar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(27,58,92,.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position:     'fixed',
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        zIndex:       101,
        background:   '#fff',
        borderRadius: 16,
        boxShadow:    '0 24px 64px rgba(27,58,92,.22)',
        width:        '100%',
        maxWidth:     580,
        maxHeight:    '90vh',
        display:      'flex',
        flexDirection:'column',
        overflow:     'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding:      '20px 24px 16px',
          borderBottom: '1px solid var(--border-sky)',
          flexShrink:   0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--navy)', fontWeight: 700 }}>
              Novo Agendamento
            </span>
            <button onClick={fechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: 20, lineHeight: 1, padding: 4 }}>
              ×
            </button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 4 }}>
            {PASSOS.map((label, i) => {
              const n       = i + 1;
              const ativo   = passo === n;
              const feito   = passo > n;
              return (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height:     3,
                    borderRadius: 2,
                    background: feito || ativo ? 'var(--navy)' : 'var(--border-sky)',
                    marginBottom: 5,
                    transition: 'background .2s',
                  }} />
                  <span style={{
                    fontSize:   10,
                    fontWeight: ativo ? 700 : 400,
                    color:      feito || ativo ? 'var(--navy)' : 'var(--text-soft)',
                  }}>
                    {feito ? '✓ ' : ''}{label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── PASSO 1: Busca de Paciente ── */}
          {passo === 1 && (
            <div>
              <label style={labelStyle}>Buscar paciente</label>
              <input
                autoFocus
                type="text"
                placeholder="Nome ou CPF..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={inputStyle}
              />

              {buscando && (
                <p style={{ color: 'var(--text-soft)', fontSize: 12, marginTop: 8 }}>Buscando...</p>
              )}

              {resultados.length > 0 && !paciente && (
                <div style={{ marginTop: 8, border: '1px solid var(--border-sky)', borderRadius: 8, overflow: 'hidden' }}>
                  {resultados.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setPaciente(p); setBusca(p.nome); setResultados([]); }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-sky)',
                        transition: 'background .1s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--sky-pale)'}
                      onMouseOut={e  => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{p.nome}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                        {p.cpf} {p.convenioNome ? `· ${p.convenioNome}` : '· Particular'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {paciente && (
                <div style={{
                  marginTop: 10,
                  padding: '12px 16px',
                  background: 'var(--green-pale)',
                  border: '1.5px solid var(--green-bdr)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{paciente.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                      {paciente.cpf} {paciente.convenioNome ? `· ${paciente.convenioNome}` : '· Particular'}
                    </div>
                  </div>
                  <button
                    onClick={() => { setPaciente(null); setBusca(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: 16 }}
                  >×</button>
                </div>
              )}

              {buscaQuery && !buscando && resultados.length === 0 && !paciente && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 10 }}>
                    Nenhum paciente encontrado.
                  </p>
                  <button style={btnSecundario}>+ Cadastrar novo paciente</button>
                </div>
              )}
            </div>
          )}

          {/* ── PASSO 2: Dados da Consulta ── */}
          {passo === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Especialidade</label>
                <select
                  value={esp}
                  onChange={e => { setEsp(e.target.value); setProfId(null); setHorario(null); }}
                  style={inputStyle}
                >
                  {ESPECIALIDADES.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Profissional</label>
                <select
                  value={profId || ''}
                  onChange={e => { setProfId(e.target.value || null); setHorario(null); }}
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {profs.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={e => { setData(e.target.value); setHorario(null); }}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Duração</label>
                  <select value={duracao} onChange={e => setDuracao(Number(e.target.value))} style={inputStyle}>
                    {DURACOES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {profId && (
                <div>
                  <label style={labelStyle}>
                    Horário {horariosDisponiveis === null ? '(carregando...)' : ''}
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6,
                    maxHeight: 180,
                    overflowY: 'auto',
                    padding: 2,
                  }}>
                    {HORARIOS.map(h => {
                      const disponivel = horariosDisponiveis === null
                        ? false
                        : (horariosDisponiveis.length === 0 || horariosDisponiveis.includes(h));
                      const selecionado = horario === h;
                      return (
                        <button
                          key={h}
                          disabled={!disponivel}
                          onClick={() => setHorario(h)}
                          style={{
                            padding:      '6px 4px',
                            borderRadius: 6,
                            border:       selecionado ? '2px solid var(--navy)' : '1.5px solid var(--border-sky)',
                            background:   selecionado ? 'var(--navy)' : disponivel ? '#fff' : 'var(--sky-mist)',
                            color:        selecionado ? '#fff' : disponivel ? 'var(--navy)' : 'var(--text-soft)',
                            cursor:       disponivel ? 'pointer' : 'not-allowed',
                            fontSize:     11,
                            fontWeight:   selecionado ? 700 : 400,
                            opacity:      disponivel ? 1 : 0.5,
                          }}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Sala <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(opcional)</span></label>
                <select value={salaId || ''} onChange={e => setSalaId(e.target.value || null)} style={inputStyle}>
                  <option value="">Sem sala definida</option>
                  {salas.map(s => (
                    <option key={s.id} value={s.id}>{s.nome || s.identificacao || `Sala ${s.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── PASSO 3: Confirmação ── */}
          {passo === 3 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
                Revise os dados antes de confirmar.
              </p>

              <div style={{ background: 'var(--sky-mist)', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ResumoLinha label="Paciente"      valor={paciente?.nome} />
                <ResumoLinha label="Convênio"      valor={paciente?.convenioNome || 'Particular'} />
                <ResumoLinha label="Especialidade" valor={esp} />
                <ResumoLinha label="Profissional"  valor={profSelecionado?.nome} />
                <ResumoLinha label="Data"          valor={format(new Date(data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
                <ResumoLinha label="Horário"       valor={horario} />
                <ResumoLinha label="Duração"       valor={DURACOES.find(d => d.value === duracao)?.label} />
                {salaSelecionada && <ResumoLinha label="Sala" valor={salaSelecionada.nome || salaSelecionada.identificacao} />}
              </div>

              {erro && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, color: '#C53030', fontSize: 13 }}>
                  {erro}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:      '14px 24px',
          borderTop:    '1px solid var(--border-sky)',
          display:      'flex',
          justifyContent: 'space-between',
          alignItems:   'center',
          flexShrink:   0,
          background:   '#fff',
        }}>
          <button
            onClick={passo === 1 ? fechar : () => setPasso(p => p - 1)}
            style={btnSecundario}
          >
            {passo === 1 ? 'Cancelar' : '← Voltar'}
          </button>

          {passo < 3 ? (
            <button
              onClick={() => setPasso(p => p + 1)}
              disabled={!podeProsseguir()}
              style={{
                ...btnPrimario,
                opacity: podeProsseguir() ? 1 : 0.5,
                cursor:  podeProsseguir() ? 'pointer' : 'not-allowed',
              }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={confirmar}
              disabled={criar.isPending}
              style={{
                ...btnPrimario,
                background: 'var(--color-success)',
                opacity: criar.isPending ? 0.7 : 1,
              }}
            >
              {criar.isPending ? 'Salvando...' : '✓ Confirmar Agendamento'}
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:     'fixed',
          bottom:       32,
          right:        32,
          zIndex:       200,
          background:   'var(--color-success)',
          color:        '#fff',
          padding:      '12px 20px',
          borderRadius: 10,
          fontWeight:   700,
          fontSize:     13,
          boxShadow:    '0 8px 24px rgba(56,161,105,.35)',
        }}>
          ✓ {toast}
        </div>
      )}
    </>
  );
}

function ResumoLinha({ label, valor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--text-soft)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{valor || '—'}</span>
    </div>
  );
}

const labelStyle = {
  display:       'block',
  fontSize:      11,
  fontWeight:    700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color:         'var(--text-soft)',
  marginBottom:  5,
};

const inputStyle = {
  width:        '100%',
  height:       42,
  padding:      '0 12px',
  border:       '1.5px solid var(--border-sky)',
  borderRadius: 8,
  background:   'var(--sky-mist)',
  fontFamily:   'var(--font-lato)',
  fontSize:     13,
  color:        'var(--text-navy)',
  outline:      'none',
  boxSizing:    'border-box',
};

const btnPrimario = {
  padding:      '9px 20px',
  border:       'none',
  borderRadius: 8,
  background:   'var(--navy)',
  color:        '#fff',
  fontFamily:   'var(--font-lato)',
  fontSize:     13,
  fontWeight:   700,
  cursor:       'pointer',
};

const btnSecundario = {
  padding:      '9px 16px',
  border:       '1.5px solid var(--border-sky)',
  borderRadius: 8,
  background:   '#fff',
  color:        'var(--text-soft)',
  fontFamily:   'var(--font-lato)',
  fontSize:     13,
  fontWeight:   400,
  cursor:       'pointer',
};
