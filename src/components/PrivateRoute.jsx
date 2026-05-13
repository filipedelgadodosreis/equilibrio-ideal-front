import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rotas por autenticação e, opcionalmente, por perfil.
 *
 * @param {string[]} perfis - lista de perfis permitidos (ex: ['Admin', 'Recepcao'])
 *                            se vazio, qualquer usuário autenticado pode acessar.
 */
export default function PrivateRoute({ perfis = [] }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        Carregando…
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (perfis.length > 0 && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return <Outlet />;
}
