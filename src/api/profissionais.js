import client from './client';

export const profissionaisApi = {
  listar: (params) => client.get('/profissionais', { params }),
  obter:  (id)     => client.get(`/profissionais/${id}`),
};
