import client from './client';

export const agendamentosApi = {
  listar: (params) =>
    client.get('/agendamentos', { params }),

  obter: (id) =>
    client.get(`/agendamentos/${id}`),

  disponibilidade: (profissionalId, data) =>
    client.get('/agendamentos/disponibilidade', {
      params: { profissionalId, data },
    }),

  criar: (data) =>
    client.post('/agendamentos', data),

  alterarStatus: (id, novoStatus, motivoCancelamento = null) =>
    client.patch(`/agendamentos/${id}/status`, {
      novoStatus,
      motivoCancelamento,
    }),
};
