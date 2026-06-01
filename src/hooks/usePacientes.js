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
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['pacientes'] }),
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
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['pacientes'] }),
  });
}
