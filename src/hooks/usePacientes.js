import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesApi } from '../api/pacientes';
import { conveniosApi } from '../api/convenios';

export function usePacientes(filtros = {}) {
  return useQuery({
    queryKey: ['pacientes', filtros],
    queryFn:  () => pacientesApi.listar(filtros),
    select:   (res) => res.data,
  });
}

export function usePaciente(id) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn:  () => pacientesApi.obter(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });
}

export function useHistoricoPaciente(id) {
  return useQuery({
    queryKey: ['paciente-historico', id],
    queryFn:  () => pacientesApi.historico(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });
}

export function useConvenios() {
  return useQuery({
    queryKey:  ['convenios'],
    queryFn:   () => conveniosApi.listar(),
    select:    (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCriarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pacientesApi.criar,
    onSuccess:  (res) => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      // A resposta do POST já traz a ficha criada: semear ['paciente', id]
      // evita que a ficha passe por "Carregando…" logo após salvar, o que
      // esconderia a mensagem de sucesso no meio da transição.
      const criado = res?.data;
      if (criado?.id != null) qc.setQueryData(['paciente', criado.id], res);
    },
  });
}

export function useAtualizarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => pacientesApi.atualizar(id, data),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      qc.invalidateQueries({ queryKey: ['paciente', id] });
    },
  });
}

export function useAlterarStatusPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }) => pacientesApi.alterarStatus(id, ativo),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      // A ficha lê ['paciente', id], que não casa por prefixo com ['pacientes'].
      // Sem esta linha o selo e o botão de status continuariam mostrando o
      // estado anterior depois de inativar ou reativar.
      qc.invalidateQueries({ queryKey: ['paciente'] });
    },
  });
}
