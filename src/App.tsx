import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Clientes from './pages/Clientes'
import Vendas from './pages/Vendas'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f232c', color: '#e6e8ee', border: '1px solid #2a2f3a', fontSize: '14px' },
          success: { iconTheme: { primary: '#4fd1a5', secondary: '#1f232c' } },
          error: { iconTheme: { primary: '#f2766f', secondary: '#1f232c' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
