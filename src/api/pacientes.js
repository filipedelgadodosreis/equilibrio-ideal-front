import client from './client';

export const pacientesApi = {
  listar:        (params)    => client.get('/pacientes', { params }),
  obter:         (id)        => client.get(`/pacientes/${id}`),
  criar:         (data)      => client.post('/pacientes', data),
  atualizar:     (id, data)  => client.put(`/pacientes/${id}`, data),
  alterarStatus: (id, ativo) => client.patch(`/pacientes/${id}/status`, { ativo }),
  historico:     (id)        => client.get(`/pacientes/${id}/historico`),
};
