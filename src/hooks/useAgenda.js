import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { agendamentosApi } from '../api/agendamentos';
import { profissionaisApi } from '../api/profissionais';
import { salasApi } from '../api/salas';

export function useProfissionais(especialidade = null) {
  return useQuery({
    queryKey:  ['profissionais', especialidade],
    queryFn:   () => profissionaisApi.listar({ especialidade, ativo: true }),
    select:    (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalas() {
  return useQuery({
    queryKey:  ['salas'],
    queryFn:   () => salasApi.listar(),
    select:    (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAgendamentos(data, filtros = {}) {
  return useQuery({
    queryKey:        ['agendamentos', format(data, 'yyyy-MM-dd'), filtros],
    queryFn:         () => agendamentosApi.listar({
      data: format(data, 'yyyy-MM-dd'),
      ...filtros,
    }),
    select:          (res) => res.data,
    refetchInterval: 30000,
  });
}

export function useDisponibilidade(profissionalId, data) {
  return useQuery({
    queryKey: ['disponibilidade', profissionalId, format(data, 'yyyy-MM-dd')],
    queryFn:  () => agendamentosApi.disponibilidade(
      profissionalId,
      format(data, 'yyyy-MM-dd'),
    ),
    select:  (res) => res.data,
    enabled: !!profissionalId,
  });
}

export function useCriarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agendamentosApi.criar,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  });
}

export function useAlterarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, novoStatus, motivo }) =>
      agendamentosApi.alterarStatus(id, novoStatus, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendamentos'] }),
  });
}
