import { useMemo, useState } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import { ListaPacientes } from '../components/pacientes/ListaPacientes';
import { FichaPaciente } from '../components/pacientes/FichaPaciente';

// Opções de ordenação. `campo` é o dado que cada uma exige: enquanto a API não
// o projetar no DTO da lista, a opção aparece desabilitada em vez de inerte.
const ORDENACOES = [
  { key: 'nome',     label: 'Nome A–Z',         campo: null },
  { key: 'ultima',   label: 'Última consulta',  campo: 'ultimaConsulta' },
  { key: 'cadastro', label: 'Data de cadastro', campo: 'dataCadastro' },
];

const temConvenio = p => !!(p.convenioId || p.convenioNome);

// Datas ISO ordenam lexicograficamente na mesma ordem que cronologicamente.
// Ausentes vão para o fim, para não ocuparem o topo do mais recente.
function porIsoDesc(campo) {
  return (a, b) => {
    const va = a[campo], vb = b[campo];
    if (!va && !vb) return 0;
    if (!va) return 1;
    if (!vb) return -1;
    return va < vb ? 1 : va > vb ? -1 : 0;
  };
}

export default function Pacientes() {
  const [modo, setModo]    = useState('lista'); // 'lista' | 'ficha' | 'novo'
  const [paciente, setPac] = useState(null);
  const [editarAoAbrir, setEditarAoAbrir] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca]   = useState('');
  const [ordem, setOrdem]   = useState('nome');
  const [data, setData]     = useState(new Date());

  // Só a busca vai para a API. O recorte por tipo/status é feito no cliente
  // para que cada chip exiba a própria contagem a partir de um único conjunto
  // — com filtro server-side a lista só conteria o subconjunto ativo.
  // TODO: voltar a filtrar no servidor quando GET /pacientes ganhar paginação;
  // hoje o endpoint devolve o conjunto inteiro, então o custo é aceitável.
  const { data: pacientes = [], isLoading } = usePacientes({ busca: busca || undefined });

  const contagens = useMemo(() => ({
    todos: pacientes.length,
    conv:  pacientes.filter(temConvenio).length,
    part:  pacientes.filter(p => !temConvenio(p)).length,
    ativo: pacientes.filter(p => p.ativo).length,
  }), [pacientes]);

  const ordenacoes = useMemo(() => ORDENACOES.map(o => ({
    ...o,
    disponivel: !o.campo || pacientes.some(p => p[o.campo] != null),
  })), [pacientes]);

  const visiveis = useMemo(() => {
    const filtrados = pacientes.filter(p => {
      if (filtro === 'conv')  return temConvenio(p);
      if (filtro === 'part')  return !temConvenio(p);
      if (filtro === 'ativo') return !!p.ativo;
      return true;
    });
    if (ordem === 'ultima')   return [...filtrados].sort(porIsoDesc('ultimaConsulta'));
    if (ordem === 'cadastro') return [...filtrados].sort(porIsoDesc('dataCadastro'));
    return [...filtrados].sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [pacientes, filtro, ordem]);

  function abrirFicha(p, editando = false) { setPac(p); setEditarAoAbrir(editando); setModo('ficha'); }
  function abrirNovo()   { setPac(null); setEditarAoAbrir(false); setModo('novo'); }
  function voltarLista() { setPac(null); setEditarAoAbrir(false); setModo('lista'); }

  if (modo === 'ficha' || modo === 'novo') {
    return (
      <FichaPaciente
        pacienteId={paciente?.id ?? null}
        isNovo={modo === 'novo'}
        iniciarEditando={editarAoAbrir}
        onVoltar={voltarLista}
        onSalvo={(criado) => { setPac(criado); setEditarAoAbrir(false); setModo('ficha'); }}
        selectedDate={data}
        onDateChange={setData}
      />
    );
  }

  return (
    <ListaPacientes
      pacientes={visiveis}
      isLoading={isLoading}
      contagens={contagens}
      filtroStatus={filtro}
      onFiltroChange={setFiltro}
      busca={busca}
      onBuscaChange={setBusca}
      ordem={ordem}
      onOrdemChange={setOrdem}
      ordenacoes={ordenacoes}
      onVerFicha={p => abrirFicha(p, false)}
      onEditarFicha={p => abrirFicha(p, true)}
      onNovoPaciente={abrirNovo}
      selectedDate={data}
      onDateChange={setData}
    />
  );
}
