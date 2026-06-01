import client from './client';

export const authApi = {
  login:        (cpf, senha) => client.post('/api/auth/login', { cpf, senha }),
  me:           ()           => client.get('/api/auth/me'),
  alterarSenha: (data)       => client.patch('/api/auth/senha', data),
};
