import client from './client';

export const conveniosApi = {
  listar: () => client.get('/convenios'),
};
