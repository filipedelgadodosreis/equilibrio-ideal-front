import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(payload) {
  return payload?.exp != null && Date.now() >= payload.exp * 1000;
}

function usuarioDoPayload(payload) {
  if (!payload) return null;
  return {
    id:     payload.sub,
    nome:   payload.nome,
    cpf:    payload.cpf,
    perfil: payload.role,
  };
}

function tokenInicial() {
  const salvo = localStorage.getItem('eq_token');
  if (!salvo) return null;
  const payload = decodeJwt(salvo);
  if (!payload || isExpired(payload)) {
    localStorage.removeItem('eq_token');
    return null;
  }
  return salvo;
}

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(tokenInicial);
  const [usuario, setUsuario] = useState(() => usuarioDoPayload(decodeJwt(token)));
  const carregando             = false;

  const navigate = useNavigate();

  const login = useCallback(async (cpf, senha) => {
    const dados = await apiLogin(cpf, senha);
    localStorage.setItem('eq_token', dados.token);
    const payload = decodeJwt(dados.token);
    const u = usuarioDoPayload(payload);
    setToken(dados.token);
    setUsuario(u);
    return u?.perfil;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eq_token');
    setToken(null);
    setUsuario(null);
    navigate('/login');
  }, [navigate]);

  const valor = useMemo(
    () => ({ usuario, token, carregando, login, logout }),
    [usuario, token, login, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
