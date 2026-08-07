import { useEffect, useState } from 'react'
import { getCustomers, getInvoices, recordPayment, prepareBankDeposit, getBankDeposits } from '../../services/api.js'

export default function Payments() {
  const [customers, setCustomers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [deposits, setDeposits] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [chequeAmount, setChequeAmount] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    getCustomers().then((cs) => {
      setCustomers(cs)
      if (cs[0]) setCustomerId(cs[0]._id)
    })
    getInvoices('unpaid').then(setInvoices)
    getBankDeposits().then(setDeposits)
  }

  useEffect(refresh, [])

  const customerInvoices = invoices.filter((i) => i.customer === customerId)
  const remittanceTotal = customerInvoices
    .filter((i) => selectedInvoices.includes(i._id))
    .reduce((sum, i) => sum + i.totalAmount, 0)

  function toggleInvoice(id) {
    setSelectedInvoices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit() {
    setError(null)
    setResult(null)
    if (selectedInvoices.length === 0 || !chequeAmount) {
      setError('Select at least one invoice and enter the cheque amount')
      return
    }
    setSubmitting(true)
    try {
      const payment = await recordPayment({
        customerId,
        chequeAmount: Number(chequeAmount),
        invoiceIds: selectedInvoices,
      })
      setResult(payment)
      setSelectedInvoices([])
      setChequeAmount('')
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBankDeposit() {
    setError(null)
    try {
      await prepareBankDeposit()
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to prepare bank deposit')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Match a cheque + remittance advice against outstanding invoices (FR23-FR26).
        </p>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value)
              setSelectedInvoices([])
            }}
            className="w-full mb-4 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Outstanding invoices</label>
          {customerInvoices.length === 0 && <p className="text-xs text-slate-400 mb-4">No outstanding invoices for this customer.</p>}
          <div className="space-y-2 mb-4">
            {customerInvoices.map((inv) => (
              <label key={inv._id} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedInvoices.includes(inv._id)}
                  onChange={() => toggleInvoice(inv._id)}
                />
                <span className="flex-1 text-slate-700 dark:text-slate-200">#{inv._id.slice(-6).toUpperCase()}</span>
                <span className="text-slate-500 dark:text-slate-400">EGP {inv.totalAmount.toFixed(2)}</span>
              </label>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Remittance total: <strong className="text-slate-700 dark:text-slate-200">EGP {remittanceTotal.toFixed(2)}</strong>
          </div>

          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cheque amount</label>
          <input
            type="number"
            value={chequeAmount}
            onChange={(e) => setChequeAmount(e.target.value)}
            className="w-full mb-4 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
            placeholder="e.g. 90.00"
          />

          {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Recording…' : 'Record Payment'}
          </button>
        </div>

        {result && (
          <div className={`mt-4 rounded-xl p-4 border-l-4 bg-white dark:bg-slate-900 ${result.discrepancy ? 'border-amber-500' : 'border-emerald-500'}`}>
            <h3 className={`text-sm font-semibold mb-1 ${result.discrepancy ? 'text-amber-600' : 'text-emerald-600'}`}>
              {result.discrepancy ? 'Discrepancy flagged — pending review' : 'Payment matched'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cheque: EGP {result.chequeAmount.toFixed(2)} · Remittance: EGP {result.remittanceTotal.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Bank Deposit</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Compile all of today's confirmed cheques into a single deposit record (FR27).
          </p>
          <button
            onClick={handleBankDeposit}
            className="text-xs font-semibold bg-slate-900 dark:bg-brand-600 text-white rounded-lg px-4 py-2"
          >
            Prepare Today's Bank Deposit
          </button>
        </div>

        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deposit History</h2>
        <div className="space-y-2">
          {deposits.map((d) => (
            <div key={d._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                {new Date(d.depositDate).toLocaleDateString()} — {d.payments.length} cheque(s)
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">EGP {d.totalAmount.toFixed(2)}</span>
            </div>
          ))}
          {deposits.length === 0 && <p className="text-xs text-slate-400">No bank deposits prepared yet.</p>}
        </div>
      </div>
    </div>
  )
}
