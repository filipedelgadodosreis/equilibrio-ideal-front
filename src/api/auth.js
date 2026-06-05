import client from './client';

export const authApi = {
  login:        (cpf, senha) => client.post('/auth/login', { cpf, senha }),
  me:           ()           => client.get('/auth/me'),
  alterarSenha: (data)       => client.patch('/auth/senha', data),
};
