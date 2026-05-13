import client from './client';

export const login = (cpf, senha) =>
  client.post('/auth/login', { cpf, senha }).then((r) => r.data);

export const me = () =>
  client.get('/auth/me').then((r) => r.data);

export const alterarSenha = (data) =>
  client.patch('/auth/senha', data);
