import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const FormularioKYCPage = lazy(() => import('@/pages/FormularioKYC'))
const ConfirmacionPage = lazy(() => import('@/pages/Confirmacion'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

function PageFallback(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-muted-foreground">Cargando...</div>
    </div>
  )
}

export function AppRouter(): JSX.Element {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/no-encontrado" replace />} />
        <Route path="/formulario/:token" element={<FormularioKYCPage />} />
        <Route path="/formulario/:token/exito" element={<ConfirmacionPage />} />
        <Route path="/no-encontrado" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
