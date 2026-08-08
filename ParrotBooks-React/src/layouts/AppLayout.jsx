import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import logo from '../assets/logo.png'

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
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = NAV_ITEMS.filter((i) => i.roles.includes(user?.role))
  const currentLabel = items.find((i) => i.to === location.pathname)?.label || 'Parrot Books'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    setSidebarOpen(false) // auto-close drawer on mobile after choosing a page
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed on desktop (md+), slide-in drawer on mobile */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 sm:w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Parrot Books" className="w-9 h-9 rounded-full shrink-0" />
            <div>
              <div className="text-base font-semibold text-white leading-tight">Parrot Books</div>
              <div className="text-xs text-slate-400">Sales System</div>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white text-xl leading-none px-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2.5 md:py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="mb-2 truncate">{user?.fullName}</div>
          <div className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wide">
            {user?.role}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-14 flex items-center justify-between gap-2 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="md:hidden text-slate-600 dark:text-slate-300 p-1.5 -ml-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-current mb-1"></span>
              <span className="block w-5 h-0.5 bg-current mb-1"></span>
              <span className="block w-5 h-0.5 bg-current"></span>
            </button>
            <span className="md:hidden text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {currentLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggle}
              className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {dark ? '☀️' : '🌙'}<span className="hidden sm:inline"> {dark ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
