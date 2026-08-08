import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getDashboardSummary } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.error || 'Could not load dashboard data'))
  }, [])

  const chartData = summary
    ? Object.entries(summary.ordersByStatus).map(([status, count]) => ({ status, count }))
    : []

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
        Welcome back, {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Here's what's happening across Parrot Books today.</p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">{error}</div>}

      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Outstanding Invoices" value={summary.outstandingInvoiceCount} accent="amber" />
            <StatCard label="Outstanding Balance" value={`EGP ${summary.outstandingBalance.toFixed(2)}`} accent="rose" />
            <StatCard label="Total Revenue" value={`EGP ${summary.totalRevenue.toFixed(2)}`} accent="emerald" />
            <StatCard label="Customers" value={summary.customerCount} accent="brand" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Orders by Status</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b6fed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Low Stock Alert</h2>
              {summary.lowStockBooks.length === 0 && (
                <p className="text-xs text-slate-400">All titles are well stocked.</p>
              )}
              <ul className="space-y-2">
                {summary.lowStockBooks.map((b) => (
                  <li key={b._id} className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{b.title}</span>
                    <span className="text-amber-600 font-medium shrink-0">{b.stock} left</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  const accents = {
    brand: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md mb-2 ${accents[accent]}`}>
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}
