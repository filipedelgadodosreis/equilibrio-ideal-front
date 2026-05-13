import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login         from './pages/Login';
import Agenda        from './pages/Agenda';
import Pacientes     from './pages/Pacientes';
import Profissionais from './pages/Profissionais';
import Salas         from './pages/Salas';
import PainelControle from './pages/PainelControle';
import Faturamento   from './pages/Faturamento';
import Relatorio     from './pages/Relatorio';
import Auditoria     from './pages/Auditoria';
import Configuracoes from './pages/Configuracoes';
import MinhaAgenda   from './pages/MinhaAgenda';
import MinhaFila     from './pages/MinhaFila';
import AppPaciente   from './pages/AppPaciente';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* ── Pública ─────────────────────────────────────────────── */}
            <Route path="/login" element={<Login />} />

            {/* ── Admin + Recepção ─────────────────────────────────────── */}
            <Route element={<PrivateRoute perfis={['Admin', 'Recepcao']} />}>
              <Route path="/agenda"        element={<Agenda />} />
              <Route path="/pacientes"     element={<Pacientes />} />
              <Route path="/profissionais" element={<Profissionais />} />
              <Route path="/salas"         element={<Salas />} />
              <Route path="/painel-senhas" element={<PainelControle />} />
            </Route>

            {/* ── Admin only ───────────────────────────────────────────── */}
            <Route element={<PrivateRoute perfis={['Admin']} />}>
              <Route path="/faturamento"      element={<Faturamento />} />
              <Route path="/relatorio-agenda" element={<Relatorio />} />
              <Route path="/auditoria"        element={<Auditoria />} />
              <Route path="/configuracoes"    element={<Configuracoes />} />
            </Route>

            {/* ── Profissional ─────────────────────────────────────────── */}
            <Route element={<PrivateRoute perfis={['Profissional']} />}>
              <Route path="/minha-agenda" element={<MinhaAgenda />} />
              <Route path="/minha-fila"   element={<MinhaFila />} />
            </Route>

            {/* ── Paciente ─────────────────────────────────────────────── */}
            <Route element={<PrivateRoute perfis={['Paciente']} />}>
              <Route path="/app" element={<AppPaciente />} />
            </Route>

            {/* ── Sem permissão ────────────────────────────────────────── */}
            <Route
              path="/sem-permissao"
              element={
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)', fontFamily: 'var(--font-lato)' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Acesso negado</p>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-soft)' }}>Você não tem permissão para acessar esta página.</p>
                </div>
              }
            />

            {/* ── Catch-all ────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
