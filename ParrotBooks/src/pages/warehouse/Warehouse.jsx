import { useEffect, useState } from 'react'
import { getOrders, generatePickingTicket } from '../../services/api.js'

export default function Warehouse() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function refresh() {
    getOrders('validated').then(setOrders).catch(() => setError('Could not load orders'))
  }

  useEffect(refresh, [])

  async function handlePick(orderId) {
    setBusyId(orderId)
    try {
      await generatePickingTicket(orderId)
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate picking ticket')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Warehouse</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Orders ready for picking (FR15 — only in-stock lines are picked).
      </p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{error}</div>}

      {orders.length === 0 && <p className="text-sm text-slate-400">No orders currently awaiting picking.</p>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Order #{o._id.slice(-6).toUpperCase()} — {o.customerName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {o.items.filter((i) => i.lineStatus === 'ok').length} in-stock line(s) · EGP {o.total.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => handlePick(o._id)}
              disabled={busyId === o._id}
              className="text-xs font-semibold bg-slate-900 dark:bg-brand-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
            >
              {busyId === o._id ? 'Generating…' : 'Generate Picking Ticket'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
