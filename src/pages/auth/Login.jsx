import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const DEMO_ACCOUNTS = [
  { username: 'admin', role: 'Admin' },
  { username: 'sales', role: 'Sales' },
  { username: 'warehouse', role: 'Warehouse' },
  { username: 'accounts', role: 'Accounts' },
]

export default function Login() {
  const [username, setUsername] = useState('sales')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed — could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-brand-700 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-3xl mb-1">🦜</div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Parrot Books</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sales &amp; Distribution System</p>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Demo accounts (password123)</p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.username}
                type="button"
                onClick={() => {
                  setUsername(a.username)
                  setPassword('password123')
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {a.username}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
