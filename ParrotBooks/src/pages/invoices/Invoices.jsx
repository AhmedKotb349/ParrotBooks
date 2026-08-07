import { useEffect, useState } from 'react'
import { getDispatches, getInvoices, createInvoice } from '../../services/api.js'

export default function Invoices() {
  const [dispatches, setDispatches] = useState([])
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function refresh() {
    getDispatches().then(setDispatches).catch(() => setError('Could not load dispatches'))
    getInvoices().then(setInvoices).catch(() => setError('Could not load invoices'))
  }

  useEffect(refresh, [])

  const invoicedDispatchIds = new Set(invoices.map((i) => i.dispatch))
  const uninvoiced = dispatches.filter((d) => !invoicedDispatchIds.has(d._id))

  async function handleInvoice(dispatchId) {
    setBusyId(dispatchId)
    try {
      await createInvoice(dispatchId)
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Invoices</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Sales invoices auto-drafted from dispatch data (FR18).
      </p>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{error}</div>}

      {uninvoiced.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready to Invoice</h2>
          <div className="space-y-2 mb-6">
            {uninvoiced.map((d) => (
              <div key={d._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  Despatch #{d._id.slice(-6).toUpperCase()} — {d.carrier} — {d.items.length} item(s)
                </div>
                <button
                  onClick={() => handleInvoice(d._id)}
                  disabled={busyId === d._id}
                  className="text-xs font-semibold bg-slate-900 dark:bg-brand-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
                >
                  {busyId === d._id ? 'Generating…' : 'Generate Invoice'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">All Invoices</h2>
      <table className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <tr>
            <th className="text-left px-4 py-2">Invoice</th>
            <th className="text-left px-4 py-2">Total</th>
            <th className="text-left px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} className="border-t border-slate-100 dark:border-slate-800">
              <td className="px-4 py-2 text-slate-700 dark:text-slate-200">#{inv._id.slice(-6).toUpperCase()}</td>
              <td className="px-4 py-2 text-slate-700 dark:text-slate-200">EGP {inv.totalAmount.toFixed(2)}</td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
