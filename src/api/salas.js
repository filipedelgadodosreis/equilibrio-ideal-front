import client from './client';

export const salasApi = {
  listar: () => client.get('/salas'),
};
