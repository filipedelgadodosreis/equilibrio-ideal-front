import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Agenda from './pages/Agenda';
import AppPaciente from './pages/AppPaciente';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Backoffice — Admin, Recepção, Profissional */}
            <Route element={<PrivateRoute perfis={['Admin', 'Recepcao', 'Profissional']} />}>
              <Route path="/agenda" element={<Agenda />} />
            </Route>

            {/* Área do Paciente */}
            <Route element={<PrivateRoute perfis={['Paciente']} />}>
              <Route path="/app" element={<AppPaciente />} />
            </Route>

            {/* Sem permissão */}
            <Route
              path="/sem-permissao"
              element={
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                  Você não tem permissão para acessar esta página.
                </div>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
