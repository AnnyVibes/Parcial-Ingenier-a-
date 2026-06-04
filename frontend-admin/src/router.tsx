import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from '@/components/PrivateRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

const LoginPage = lazy(() => import('@/pages/auth/Login'))
const DashboardPage = lazy(() => import('@/pages/admin/Dashboard'))
const ExpedientesListPage = lazy(() => import('@/pages/admin/ExpedientesList'))
const ExpedienteDetailPage = lazy(() => import('@/pages/admin/ExpedienteDetail'))
const WorkflowPage = lazy(() => import('@/pages/admin/Workflow'))
const KanbanBoardPage = lazy(() => import('@/pages/admin/KanbanBoard'))
const ReportesPage = lazy(() => import('@/pages/admin/Reportes'))
const AuditoriaPage = lazy(() => import('@/pages/admin/Auditoria'))
const UsuariosPage = lazy(() => import('@/pages/admin/Usuarios'))

function PageFallback(): JSX.Element {
  return (
    <div className="p-8 space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function AppRouter(): JSX.Element {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expedientes" element={<ExpedientesListPage />} />
          <Route path="expedientes/:id" element={<ExpedienteDetailPage />} />
          <Route path="expedientes/:id/workflow" element={<WorkflowPage />} />
          <Route path="kanban" element={<KanbanBoardPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="auditoria" element={<AuditoriaPage />} />
          <Route
            path="usuarios"
            element={
              <PrivateRoute roles={['ADMINISTRADOR']}>
                <UsuariosPage />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
