import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ExpedientesListPage from "@/pages/ExpedientesListPage";
import ExpedienteDetailPage from "@/pages/ExpedienteDetailPage";
import WorkflowPage from "@/pages/WorkflowPage";
import AuditoriaPage from "@/pages/AuditoriaPage";
import AlertasPage from "@/pages/AlertasPage";
import DocumentosPage from "@/pages/DocumentosPage";
import ClientesPage from "@/pages/ClientesPage";
import PEPPage from "@/pages/PEPPage";
import ConfigPage from "@/pages/ConfigPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expedientes" element={<ExpedientesListPage />} />
        <Route path="expedientes/:id" element={<ExpedienteDetailPage />} />
        <Route path="workflow" element={<WorkflowPage />} />
        <Route path="auditoria" element={<AuditoriaPage />} />
        <Route path="alertas" element={<AlertasPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="pep" element={<PEPPage />} />
        <Route path="configuracion" element={<ConfigPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
