import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasToken } from '../config/api'

// Protege as rotas internas: sem token, vai para a tela de boas-vindas.
export default function RequireAuth() {
  const location = useLocation()
  if (!hasToken()) return <Navigate to="/welcome" replace state={{ from: location }} />
  return <Outlet />
}
