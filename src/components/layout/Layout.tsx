import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Pill, Users, ShoppingCart, Menu, X, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { clearToken } from '../../config/api'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produtos', label: 'Produtos', icon: Pill },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const sair = () => {
    clearToken()
    setOpen(false)
    navigate('/welcome', { replace: true })
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive ? 'bg-brand/15 text-brand' : 'text-ink-muted hover:bg-raised hover:text-ink',
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <button
        onClick={sair}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink"
      >
        <LogOut size={18} />
        Sair
      </button>
    </nav>
  )

  const brand = (
    <div className="flex h-16 items-center gap-2 border-b border-line px-5 font-semibold">
      <Pill className="text-success" size={20} />
      Farmácia
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:block">
        {brand}
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface">
            <div className="flex items-center justify-between">
              {brand}
              <button className="mr-3 text-ink-muted" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <span className="font-semibold">Farmácia</span>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
