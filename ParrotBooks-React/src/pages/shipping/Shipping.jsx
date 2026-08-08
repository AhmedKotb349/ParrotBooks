import { useEffect, useState } from 'react'
import { getOrders, createDispatch } from '../../services/api.js'

export default function Shipping() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [carrier, setCarrier] = useState('Rapido International')

  function refresh() {
    getOrders('picked').then(setOrders).catch(() => setError('Could not load orders'))
  }

  useEffect(refresh, [])

  async function handleDispatch(orderId) {
    setBusyId(orderId)
    try {
      await createDispatch(orderId, carrier)
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create dispatch note')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Shipping</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Orders picked and ready for despatch (FR16/FR17).
      </p>

      <div className="mb-4 max-w-xs">
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Carrier</label>
        <input
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
        />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{error}</div>}

      {orders.length === 0 && <p className="text-sm text-slate-400">No orders currently ready for despatch.</p>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Order #{o._id.slice(-6).toUpperCase()} — {o.customerName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {o.pickingTicket?.items?.length || 0} item(s) on picking ticket
              </div>
            </div>
            <button
              onClick={() => handleDispatch(o._id)}
              disabled={busyId === o._id}
              className="text-xs font-semibold bg-slate-900 dark:bg-brand-600 text-white rounded-lg px-4 py-2 disabled:opacity-60 w-full sm:w-auto shrink-0"
            >
              {busyId === o._id ? 'Dispatching…' : 'Create Despatch Note'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
