import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/sales-orders', label: 'Sales Orders', roles: ['admin', 'sales'] },
  { to: '/warehouse', label: 'Warehouse', roles: ['admin', 'warehouse'] },
  { to: '/shipping', label: 'Shipping', roles: ['admin', 'warehouse'] },
  { to: '/invoices', label: 'Invoices', roles: ['admin', 'accounts'] },
  { to: '/payments', label: 'Payments', roles: ['admin', 'accounts'] },
  { to: '/admin', label: 'Admin', roles: ['admin'] },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const items = NAV_ITEMS.filter((i) => i.roles.includes(user?.role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-base font-semibold text-white">🦜 Parrot Books</div>
          <div className="text-xs text-slate-400">Sales System</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="mb-2">{user?.fullName}</div>
          <div className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wide">
            {user?.role}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-end gap-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={toggle}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Log out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
