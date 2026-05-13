import client from './client';

export const login = (cpf, senha) =>
  client.post('/auth/login', { cpf, senha }).then((r) => r.data);

export const alterarSenha = (senhaAtual, novaSenha, confirmarSenha) =>
  client.patch('/auth/senha', { senhaAtual, novaSenha, confirmarSenha });

export const me = () =>
  client.get('/auth/me').then((r) => r.data);
