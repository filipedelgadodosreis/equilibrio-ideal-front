import { useState } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import { ListaPacientes } from '../components/pacientes/ListaPacientes';
import { FichaPaciente } from '../components/pacientes/FichaPaciente';

export default function Pacientes() {
  const [modo, setModo]    = useState('lista'); // 'lista' | 'ficha' | 'novo'
  const [paciente, setPac] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca]   = useState('');
  const [data, setData]     = useState(new Date());

  const params = {
    busca: busca || undefined,
    ativo: filtro === 'ativo' ? true : undefined,
    tipo:  filtro === 'conv' ? 'convenio' : filtro === 'part' ? 'particular' : undefined,
  };

  const { data: pacientes = [], isLoading } = usePacientes(params);

  function abrirFicha(p)  { setPac(p); setModo('ficha'); }
  function abrirNovo()    { setPac(null); setModo('novo'); }
  function voltarLista()  { setPac(null); setModo('lista'); }

  if (modo === 'ficha' || modo === 'novo') {
    return (
      <FichaPaciente
        pacienteId={paciente?.id ?? null}
        isNovo={modo === 'novo'}
        onVoltar={voltarLista}
        onSalvo={(criado) => { setPac(criado); setModo('ficha'); }}
        selectedDate={data}
        onDateChange={setData}
      />
    );
  }

  return (
    <ListaPacientes
      pacientes={pacientes}
      isLoading={isLoading}
      filtroStatus={filtro}
      onFiltroChange={setFiltro}
      busca={busca}
      onBuscaChange={setBusca}
      onVerFicha={abrirFicha}
      onNovoPaciente={abrirNovo}
      selectedDate={data}
      onDateChange={setData}
    />
  );
}
