import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '../Sidebar';
import {
  usePaciente, useHistoricoPaciente,
  useAtualizarPaciente, useAlterarStatusPaciente,
  useCriarPaciente, useConvenios,
} from '../../hooks/usePacientes';

// ── Abas ─────────────────────────────────────────────────────────────────────
const ABAS_COMPLETAS = [
  { key: 'dados',     label: 'Dados pessoais' },
  { key: 'contato',   label: 'Contato' },
  { key: 'convenio',  label: 'Convênio' },
  { key: 'endereco',  label: 'Endereço' },
  { key: 'obs',       label: 'Observações' },
  { key: 'historico', label: 'Histórico de consultas' },
];

const STATUS_HIST = {
  Realizado: { bg: 'var(--green-pale)', color: '#1A6A42',        border: 'var(--green-bdr)' },
  Cancelado:  { bg: '#FFF5F5',          color: '#C53030',         border: '#FED7D7' },
  Agendado:   { bg: 'var(--sky-pale)',   color: '#1E6FA3',         border: 'var(--sky-light)' },
  Falta:      { bg: 'var(--fono-bg)',    color: 'var(--fono-txt)', border: 'var(--fono)' },
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
             'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const FORM_VAZIO = {
  nome: '', cpf: '', rg: '', dataNascimento: '', sexo: '', estadoCivil: '',
  profissao: '', naturalidade: '',
  whatsapp: '', telefone: '', email: '', notificaWhatsapp: false,
  cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '',
  observacoes: '',
  convenioId: '', numeroCarteirinha: '', validadeCarteirinha: '', nomeTitular: '',
};

// ── Estilos utilitários ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', height: 40, padding: '0 12px',
  border: '1.5px solid var(--border)', borderRadius: 8,
  fontFamily: 'Lato, sans-serif', fontSize: 13, color: 'var(--navy)',
  background: 'var(--sky-mist)', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s, background .15s',
};

const viewValueStyle = {
  fontSize: 13, color: 'var(--navy)',
  padding: '9px 0',
  borderBottom: '1px solid rgba(212,232,242,.4)',
  minHeight: 40, display: 'flex', alignItems: 'center',
};

const secaoStyle = {
  background: '#fff', border: '1px solid var(--border)',
  borderRadius: 12, padding: '18px 20px', marginBottom: 16,
};

const secaoTituloStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: '.14em',
  textTransform: 'uppercase', color: 'var(--text-soft)',
  marginBottom: 16, display: 'flex', alignItems: 'center',
  justifyContent: 'space-between',
};

const labelStyle = {
  display: 'block', fontSize: 9.5, fontWeight: 700,
  letterSpacing: '.1em', textTransform: 'uppercase',
  color: 'var(--text-soft)', marginBottom: 5,
};

// ── Funções utilitárias ───────────────────────────────────────────────────────
function iniciais(nome = '') {
  return nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
}

function mascaraCPF(v = '') {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

function validarCPF(cpf) {
  const n = cpf.replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(n[i]) * (10 - i);
  let r = (s * 10) % 11; if (r >= 10) r = 0;
  if (r !== parseInt(n[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(n[i]) * (11 - i);
  r = (s * 10) % 11; if (r >= 10) r = 0;
  return r === parseInt(n[10]);
}

function formatData(d) {
  try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
}

// ── Componente Campo inline ───────────────────────────────────────────────────
function F({ label, field, form, view, editMode, onChange, placeholder, type = 'text', erro }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {editMode ? (
        <>
          <input
            type={type}
            value={form[field] ?? ''}
            onChange={e => onChange(field, e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, borderColor: erro ? '#FC8181' : 'var(--border)' }}
            onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = erro ? '#FC8181' : 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}
          />
          {erro && <div style={{ fontSize: 10, color: '#C53030', marginTop: 3 }}>{erro}</div>}
        </>
      ) : (
        <div style={viewValueStyle}>{view || '—'}</div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function FichaPaciente({ pacienteId, isNovo = false, onVoltar, onSalvo, selectedDate, onDateChange }) {
  const navigate = useNavigate();

  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const { data: historico = [] }      = useHistoricoPaciente(pacienteId);
  const { data: convenios = [] }      = useConvenios();
  const criar     = useCriarPaciente();
  const atualizar = useAtualizarPaciente();
  const altStatus = useAlterarStatusPaciente();

  const [abaAtiva, setAbaAtiva]               = useState('dados');
  const [editMode, setEditMode]               = useState(isNovo);
  const [form, setForm]                       = useState(FORM_VAZIO);
  const [erros, setErros]                     = useState({});
  const [erro, setErro]                       = useState('');
  const [toast, setToast]                     = useState(null);
  const [confirmInativar, setConfirmInativar] = useState(false);

  useEffect(() => {
    if (paciente && !isNovo) setForm({ ...FORM_VAZIO, ...paciente });
  }, [paciente, isNovo]);

  const abas = isNovo
    ? ABAS_COMPLETAS.filter(a => a.key !== 'historico')
    : ABAS_COMPLETAS;

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (erros[field]) setErros(prev => ({ ...prev, [field]: undefined }));
  }

  function descartar() {
    if (isNovo) { onVoltar(); return; }
    setForm({ ...FORM_VAZIO, ...paciente });
    setEditMode(false);
    setErros({});
    setErro('');
  }

  function validar() {
    const e = {};
    if (!form.nome?.trim()) e.nome = 'Nome obrigatório.';
    if (!form.cpf?.trim()) e.cpf = 'CPF obrigatório.';
    else if (!validarCPF(form.cpf)) e.cpf = 'CPF inválido.';
    return e;
  }

  async function salvar() {
    const v = validar();
    if (Object.keys(v).length) { setErros(v); return; }
    setErro('');
    try {
      const payload = { ...form, cpf: form.cpf.replace(/\D/g, ''), convenioId: form.convenioId || null };
      if (isNovo) {
        const res = await criar.mutateAsync(payload);
        setToast('Paciente cadastrado com sucesso!');
        setTimeout(() => { setToast(null); onSalvo?.(res.data); }, 1500);
      } else {
        await atualizar.mutateAsync({ id: pacienteId, data: payload });
        setEditMode(false);
        setToast('Alterações salvas com sucesso!');
        setTimeout(() => setToast(null), 2500);
      }
    } catch (err) {
      setErro(err?.response?.data?.message || 'Erro ao salvar. Verifique os dados.');
    }
  }

  async function toggleStatus() {
    if (!paciente) return;
    if (paciente.ativo) { setConfirmInativar(true); return; }
    await altStatus.mutateAsync({ id: pacienteId, ativo: true });
    setToast('Paciente reativado!');
    setTimeout(() => setToast(null), 2000);
  }

  async function confirmarInativacao() {
    setConfirmInativar(false);
    await altStatus.mutateAsync({ id: pacienteId, ativo: false });
    setToast('Paciente inativado.');
    setTimeout(() => setToast(null), 2000);
  }

  function agendar() {
    if (paciente) {
      sessionStorage.setItem('agendarPaciente', JSON.stringify({
        id: paciente.id, nome: paciente.nome, conv: paciente.convenioNome,
      }));
    }
    navigate('/agenda');
  }

  const isPending = criar.isPending || atualizar.isPending;

  const convenioNomeAtual = form.convenioId
    ? (convenios.find(c => String(c.id) === String(form.convenioId))?.nome || 'Convênio')
    : 'Particular';

  if (!isNovo && (isLoading || !paciente)) {
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-lato)' }}>
        <Sidebar selectedDate={selectedDate} onDateChange={onDateChange} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', fontSize: 13 }}>
          {isLoading ? 'Carregando ficha...' : 'Paciente não encontrado.'}
        </div>
      </div>
    );
  }

  const p = paciente || {};

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sky-mist)', fontFamily: 'var(--font-lato)' }}>
      <Sidebar selectedDate={selectedDate} onDateChange={onDateChange} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Header ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>

          {/* Linha de ações */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--white)',
          }}>
            <button onClick={onVoltar} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 13, color: 'var(--text-soft)',
              fontFamily: 'Lato, sans-serif',
            }}>
              ← Voltar
            </button>

            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 20, color: 'var(--navy)', fontWeight: 500,
            }}>
              {isNovo ? 'Novo Paciente' : p.nome}
            </span>

            <div style={{ flex: 1 }} />

            {/* Agendar consulta — sempre visível */}
            <button onClick={agendar} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              border: '1.5px solid var(--sky)',
              borderRadius: 7, background: 'var(--sky-pale)',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              color: 'var(--sky)', fontFamily: 'Lato, sans-serif',
            }}>
              📅 Agendar consulta
            </button>

            {/* Inativar/Reativar — só para paciente existente */}
            {!isNovo && (
              <button onClick={toggleStatus} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                border: `1.5px solid ${p.ativo ? '#F5B8B8' : 'var(--green-bdr)'}`,
                borderRadius: 7,
                background: p.ativo ? 'var(--red-pale)' : 'var(--green-pale)',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                color: p.ativo ? 'var(--red)' : 'var(--green)',
                fontFamily: 'Lato, sans-serif',
              }}>
                {p.ativo ? '⊘ Inativar paciente' : '✓ Reativar paciente'}
              </button>
            )}

            {/* Cancelar edição — só quando editMode ou isNovo */}
            {(editMode || isNovo) && (
              <button onClick={descartar} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                border: 'none', borderRadius: 7,
                background: 'var(--navy)',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                color: '#fff', fontFamily: 'Lato, sans-serif',
              }}>
                ✕ Cancelar edição
              </button>
            )}
          </div>

          {/* Card resumo */}
          <div style={{ margin: '0 24px 14px', padding: '14px 20px', background: 'var(--sky-mist)', border: '1.5px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--sky-pale)', border: '2px solid var(--sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>
              {isNovo ? 'NP' : iniciais(p.nome)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--navy)', fontWeight: 600 }}>
                {isNovo ? (form.nome || 'Novo Paciente') : p.nome}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-soft)', marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <span>🇧🇷</span>
                <span style={{ padding: '1px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: form.convenioId ? 'var(--sky-pale)' : '#F2EFFA', color: form.convenioId ? '#1E6FA3' : '#6B52A8', border: `1px solid ${form.convenioId ? 'var(--sky-light)' : '#C4B5F4'}` }}>
                  {convenioNomeAtual}
                </span>
                {!isNovo && p.cpf && <span>📋 {p.cpf}</span>}
                {!isNovo && p.whatsapp && <span>📱 {p.whatsapp}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
              {['Consultas', 'Realizadas', 'Agendadas'].map(label => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--navy)', fontWeight: 600, lineHeight: 1 }}>
                    {isNovo ? 0 : label === 'Consultas' ? historico.length : label === 'Realizadas' ? historico.filter(h => h.status === 'Realizado').length : historico.filter(h => h.status === 'Agendado').length}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Abas */}
          <div style={{ display: 'flex', padding: '0 24px', gap: 2 }}>
            {abas.map(aba => (
              <button key={aba.key} onClick={() => setAbaAtiva(aba.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2.5px solid ${abaAtiva === aba.key ? 'var(--navy)' : 'transparent'}`, background: 'none', fontFamily: 'var(--font-lato)', fontSize: 12, fontWeight: 700, color: abaAtiva === aba.key ? 'var(--navy)' : 'var(--text-soft)', cursor: 'pointer', transition: 'color .15s, border-color .15s', whiteSpace: 'nowrap' }}>
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Corpo (scroll independente) ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--sky-mist)' }}>
          <div style={{ padding: '16px 24px' }}>

            {/* ── ABA DADOS ── */}
            {abaAtiva === 'dados' && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>
                  Dados pessoais
                  {!editMode && !isNovo && (
                    <span onClick={() => setEditMode(true)} style={{ fontSize: 11, color: 'var(--sky)', cursor: 'pointer', fontWeight: 700 }}>Editar</span>
                  )}
                </div>

                {/* Nome · CPF · RG */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px', marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Nome completo {isNovo && <span style={{ color: '#C53030' }}>*</span>}</label>
                    {editMode
                      ? <><input value={form.nome} onChange={e => handleChange('nome', e.target.value)} placeholder="Nome do paciente" style={{ ...inputStyle, borderColor: erros.nome ? '#FC8181' : 'var(--border)' }} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = erros.nome ? '#FC8181' : 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }} />{erros.nome && <div style={{ fontSize: 10, color: '#C53030', marginTop: 3 }}>{erros.nome}</div>}</>
                      : <div style={viewValueStyle}>{p.nome || '—'}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>CPF {isNovo && <span style={{ color: '#C53030' }}>*</span>}</label>
                    {editMode
                      ? <><input value={form.cpf} onChange={e => handleChange('cpf', mascaraCPF(e.target.value))} placeholder="000.000.000-00" style={{ ...inputStyle, borderColor: erros.cpf ? '#FC8181' : 'var(--border)' }} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = erros.cpf ? '#FC8181' : 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }} />{erros.cpf && <div style={{ fontSize: 10, color: '#C53030', marginTop: 3 }}>{erros.cpf}</div>}</>
                      : <div style={viewValueStyle}>{p.cpf || '—'}</div>}
                  </div>
                  <F label="RG" field="rg" form={form} view={p.rg} editMode={editMode} onChange={handleChange} placeholder="Opcional" />
                </div>

                {/* Data de nascimento · Sexo · Estado civil */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px', marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Data de nascimento</label>
                    {editMode
                      ? <input type="date" value={form.dataNascimento ? form.dataNascimento.substring(0, 10) : ''} onChange={e => handleChange('dataNascimento', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }} />
                      : <div style={viewValueStyle}>{p.dataNascimento ? formatData(p.dataNascimento) : '—'}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Sexo</label>
                    {editMode
                      ? <select value={form.sexo || ''} onChange={e => handleChange('sexo', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}>
                          <option value="">Selecione...</option>
                          <option>Feminino</option><option>Masculino</option><option>Outro</option>
                        </select>
                      : <div style={viewValueStyle}>{p.sexo || '—'}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Estado civil</label>
                    {editMode
                      ? <select value={form.estadoCivil || ''} onChange={e => handleChange('estadoCivil', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}>
                          <option value="">Selecione...</option>
                          <option>Solteiro(a)</option><option>Casado(a)</option>
                          <option>Divorciado(a)</option><option>Viúvo(a)</option>
                          <option>União estável</option>
                        </select>
                      : <div style={viewValueStyle}>{p.estadoCivil || '—'}</div>}
                  </div>
                </div>

                {/* Profissão · Naturalidade */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                  <F label="Profissão"    field="profissao"    form={form} view={p.profissao}    editMode={editMode} onChange={handleChange} placeholder="Opcional" />
                  <F label="Naturalidade" field="naturalidade" form={form} view={p.naturalidade} editMode={editMode} onChange={handleChange} placeholder="Opcional" />
                </div>
              </div>
            )}

            {/* ── ABA CONTATO ── */}
            {abaAtiva === 'contato' && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>
                  Contato
                  {!editMode && !isNovo && (
                    <span onClick={() => setEditMode(true)} style={{ fontSize: 11, color: 'var(--sky)', cursor: 'pointer', fontWeight: 700 }}>Editar</span>
                  )}
                </div>

                {/* WhatsApp · Telefone · E-mail */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px', marginBottom: 14 }}>
                  <F label="WhatsApp" field="whatsapp" form={form} view={p.whatsapp} editMode={editMode} onChange={handleChange} placeholder="(11) 99999-9999" />
                  <F label="Telefone" field="telefone" form={form} view={p.telefone} editMode={editMode} onChange={handleChange} placeholder="(11) 3333-4444" />
                  <F label="E-mail"   field="email"    form={form} view={p.email}    editMode={editMode} onChange={handleChange} placeholder="email@exemplo.com" type="email" />
                </div>

                {/* Notificações WhatsApp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <input
                    type="checkbox"
                    id="wppNotif"
                    checked={form.notificaWhatsapp || false}
                    onChange={e => handleChange('notificaWhatsapp', e.target.checked)}
                    disabled={!editMode}
                    style={{ width: 16, height: 16, cursor: editMode ? 'pointer' : 'default', accentColor: 'var(--sky)' }}
                  />
                  <label htmlFor="wppNotif" style={{ fontSize: 12, color: 'var(--navy)', textTransform: 'none', letterSpacing: 'normal', marginBottom: 0, cursor: editMode ? 'pointer' : 'default' }}>
                    Receber notificações por WhatsApp
                  </label>
                </div>
              </div>
            )}

            {/* ── ABA CONVÊNIO ── */}
            {abaAtiva === 'convenio' && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>
                  Convênio
                  {!editMode && !isNovo && (
                    <span onClick={() => setEditMode(true)} style={{ fontSize: 11, color: 'var(--sky)', cursor: 'pointer', fontWeight: 700 }}>Editar</span>
                  )}
                </div>

                {/* Plano de saúde — full width */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Plano de saúde</label>
                  {editMode
                    ? <select value={form.convenioId || ''} onChange={e => handleChange('convenioId', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}>
                        <option value="">Particular (sem convênio)</option>
                        {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    : <div style={viewValueStyle}>{p.convenioNome || 'Particular'}</div>}
                </div>

                {/* Campos carteirinha — só se convênio selecionado */}
                {(form.convenioId || p.convenioId) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 20px' }}>
                    <F label="Nº da carteirinha" field="numeroCarteirinha" form={form} view={p.numeroCarteirinha} editMode={editMode} onChange={handleChange} />
                    <div>
                      <label style={labelStyle}>Validade</label>
                      {editMode
                        ? <input type="month" value={form.validadeCarteirinha || ''} onChange={e => handleChange('validadeCarteirinha', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }} />
                        : <div style={viewValueStyle}>{p.validadeCarteirinha || '—'}</div>}
                    </div>
                    <F label="Nome do titular" field="nomeTitular" form={form} view={p.nomeTitular} editMode={editMode} onChange={handleChange} placeholder="Se diferente do paciente" />
                  </div>
                )}
              </div>
            )}

            {/* ── ABA ENDEREÇO ── */}
            {abaAtiva === 'endereco' && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>
                  Endereço
                  {!editMode && !isNovo && (
                    <span onClick={() => setEditMode(true)} style={{ fontSize: 11, color: 'var(--sky)', cursor: 'pointer', fontWeight: 700 }}>Editar</span>
                  )}
                </div>

                {/* CEP · Logradouro · Número */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: '14px 20px', marginBottom: 14 }}>
                  <F label="CEP"        field="cep"        form={form} view={p.cep}        editMode={editMode} onChange={handleChange} placeholder="00000-000" />
                  <F label="Logradouro" field="logradouro" form={form} view={p.logradouro} editMode={editMode} onChange={handleChange} placeholder="Rua, Av..." />
                  <F label="Número"     field="numero"     form={form} view={p.numero}     editMode={editMode} onChange={handleChange} placeholder="123" />
                </div>

                {/* Bairro · Cidade · UF */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '14px 20px' }}>
                  <F label="Bairro" field="bairro" form={form} view={p.bairro} editMode={editMode} onChange={handleChange} placeholder="Bairro" />
                  <F label="Cidade" field="cidade" form={form} view={p.cidade} editMode={editMode} onChange={handleChange} placeholder="Cidade" />
                  <div>
                    <label style={labelStyle}>UF</label>
                    {editMode
                      ? <select value={form.uf || ''} onChange={e => handleChange('uf', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}>
                          <option value="">UF</option>
                          {UFS.map(uf => <option key={uf}>{uf}</option>)}
                        </select>
                      : <div style={viewValueStyle}>{p.uf || '—'}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* ── ABA OBSERVAÇÕES ── */}
            {abaAtiva === 'obs' && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>
                  Observações clínicas
                  {!editMode && !isNovo && (
                    <span onClick={() => setEditMode(true)} style={{ fontSize: 11, color: 'var(--sky)', cursor: 'pointer', fontWeight: 700 }}>Editar</span>
                  )}
                </div>
                {editMode
                  ? <textarea
                      value={form.observacoes || ''}
                      onChange={e => handleChange('observacoes', e.target.value)}
                      placeholder="Anotações clínicas, alergias, informações relevantes..."
                      style={{ ...inputStyle, height: 120, padding: '10px 12px', resize: 'vertical' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--sky)'; e.target.style.background = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--sky-mist)'; }}
                    />
                  : <div style={{ fontSize: 13, color: p.observacoes ? 'var(--navy)' : 'var(--text-soft)', fontStyle: p.observacoes ? 'normal' : 'italic', lineHeight: 1.7 }}>
                      {p.observacoes || 'Nenhuma observação registrada.'}
                    </div>
                }
              </div>
            )}

            {/* ── ABA HISTÓRICO ── */}
            {abaAtiva === 'historico' && !isNovo && (
              <div style={secaoStyle}>
                <div style={secaoTituloStyle}>Histórico de consultas</div>
                {historico.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-soft)', fontSize: 13 }}>
                    Nenhuma consulta registrada.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--sky-mist)' }}>
                        {['Data', 'Especialidade', 'Profissional', 'Convênio', 'Status'].map(h => (
                          <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-soft)', borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map(h => {
                        const st = STATUS_HIST[h.status] || STATUS_HIST.Agendado;
                        return (
                          <tr key={h.id} style={{ borderBottom: '1px solid rgba(212,232,242,.5)' }}>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                              {format(new Date(h.dataHora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--navy)' }}>{h.especialidade}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--navy)' }}>{h.profissionalNome}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--navy)' }}>{h.convenioNome || 'Particular'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {erro && (
              <div style={{ padding: '10px 14px', background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, color: '#C53030', fontSize: 13 }}>
                {erro}
              </div>
            )}

            {/* ── Barra de edição — inline, sem sticky ── */}
            {(editMode || isNovo) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderTop: '1px solid var(--border)',
                marginTop: 4,
              }}>
                <span style={{
                  fontSize: 11, color: 'var(--text-soft)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  ✏️ Modo edição ativo
                </span>
                <div style={{ flex: 1 }} />
                <button onClick={descartar} style={{
                  padding: '7px 16px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 7, background: '#fff',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  color: 'var(--text-soft)', fontFamily: 'Lato, sans-serif',
                }}>
                  Descartar
                </button>
                <button onClick={salvar} disabled={isPending} style={{
                  padding: '7px 20px', border: 'none',
                  borderRadius: 7, background: 'var(--green)',
                  color: '#fff', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  fontFamily: 'Lato, sans-serif',
                  opacity: isPending ? .7 : 1,
                }}>
                  {isPending ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal confirmação inativação */}
      {confirmInativar && (
        <>
          <div onClick={() => setConfirmInativar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(27,58,92,.4)', backdropFilter: 'blur(2px)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 201, background: '#fff', borderRadius: 14, boxShadow: '0 20px 50px rgba(27,58,92,.2)', width: 420, padding: '28px 28px 20px', fontFamily: 'var(--font-lato)' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--navy)', marginBottom: 10 }}>Inativar paciente</div>
            <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
              Tem certeza que deseja inativar <strong style={{ color: 'var(--navy)' }}>{p.nome}</strong>?<br />
              O histórico é preservado e pode ser reativado a qualquer momento.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setConfirmInativar(false)} style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 7, background: '#fff', color: 'var(--text-soft)', fontFamily: 'var(--font-lato)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarInativacao} style={{ padding: '8px 16px', border: 'none', borderRadius: 7, background: '#C53030', color: '#fff', fontFamily: 'var(--font-lato)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Inativar</button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 300, background: 'var(--navy)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, boxShadow: '0 8px 24px rgba(27,58,92,.3)' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
