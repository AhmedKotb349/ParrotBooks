import { useEffect, useMemo, useState } from 'react'
import { getBooks, getRelatedBooks, getCustomers, createOrder } from '../../services/api.js'

export default function SalesOrders() {
  const [books, setBooks] = useState([])
  const [customers, setCustomers] = useState([])
  const [category, setCategory] = useState('All')
  const [customerId, setCustomerId] = useState('')
  const [cart, setCart] = useState({}) // bookId -> qty
  const [related, setRelated] = useState({ forTitle: null, items: [] })
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getBooks().then(setBooks).catch(() => setError('Could not load catalogue'))
    getCustomers().then((cs) => {
      setCustomers(cs)
      if (cs[0]) setCustomerId(cs[0]._id)
    })
  }, [])

  const categories = useMemo(() => ['All', ...new Set(books.map((b) => b.category))], [books])
  const visibleBooks = category === 'All' ? books : books.filter((b) => b.category === category)

  async function addToCart(book) {
    setCart((prev) => ({ ...prev, [book._id]: (prev[book._id] || 0) + 1 }))
    try {
      const items = await getRelatedBooks(book._id)
      setRelated({ forTitle: book.title, items })
    } catch {
      /* related books are a nice-to-have */
    }
  }

  function setQty(bookId, qty) {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[bookId]
      else next[bookId] = qty
      return next
    })
  }

  const cartLines = Object.entries(cart).map(([bookId, quantity]) => ({
    bookId,
    quantity,
    book: books.find((b) => b._id === bookId),
  }))
  const cartTotal = cartLines.reduce((sum, l) => sum + (l.book ? l.book.price * l.quantity : 0), 0)

  async function handleSubmit() {
    setError(null)
    setResult(null)
    if (cartLines.length === 0) return setError('Add at least one book first')
    if (!customerId) return setError('Select a customer first')

    setSubmitting(true)
    try {
      const order = await createOrder({
        customerId,
        items: cartLines.map((l) => ({ bookId: l.bookId, quantity: l.quantity })),
      })
      setResult(order)
      setCart({})
      // refresh catalogue so stock numbers reflect the new order
      getBooks().then(setBooks)
    } catch (err) {
      if (err.response?.status === 422) setResult(err.response.data)
      else setError(err.response?.data?.error || 'Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <div className="xl:col-span-2">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">New Sales Order</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Capture, validate, and check stock for a customer order.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                c === category
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-600 dark:border-brand-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {visibleBooks.map((book) => (
            <div key={book._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <img src={book.image} alt={book.title} loading="lazy" className="w-full h-40 object-cover bg-slate-100 dark:bg-slate-800" />
              <div className="p-3 flex flex-col gap-1 flex-1">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug min-h-[2.2em]">{book.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{book.author}</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">EGP {book.price.toFixed(2)}</p>
                <span
                  className={`text-[10px] font-semibold self-start px-2 py-0.5 rounded-full mt-1 ${
                    book.stock === 0
                      ? 'bg-red-50 text-red-600'
                      : book.stock < 10
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {book.stock === 0 ? 'Out of stock' : book.stock < 10 ? `${book.stock} left` : 'In stock'}
                </span>
                <button
                  onClick={() => addToCart(book)}
                  className="mt-auto text-[11px] font-semibold bg-slate-900 dark:bg-brand-600 text-white rounded-lg py-1.5 hover:opacity-90"
                >
                  + Add to order
                </button>
              </div>
            </div>
          ))}
        </div>

        {related.items.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Related to "{related.forTitle}"
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {related.items.map((b) => (
                <div key={b._id} className="min-w-[110px] max-w-[110px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0">
                  <img src={b.image} alt={b.title} className="w-full h-28 object-cover bg-slate-100 dark:bg-slate-800" />
                  <div className="p-2">
                    <div className="text-[10.5px] font-medium leading-tight min-h-[2em] text-slate-800 dark:text-slate-100">{b.title}</div>
                    <button
                      onClick={() => addToCart(b)}
                      className="mt-1 w-full text-[10px] font-semibold bg-brand-50 text-brand-700 rounded-md py-1 hover:bg-brand-100"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 xl:sticky xl:top-6">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Order Details</h2>

          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full mb-4 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {cartLines.length === 0 && <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">No items yet.</p>}

          {cartLines.length > 0 && (
            <div className="space-y-2 mb-3">
              {cartLines.map((l) => (
                <div key={l.bookId} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{l.book?.title}</span>
                  <input
                    type="number"
                    min="1"
                    value={l.quantity}
                    onChange={(e) => setQty(l.bookId, Number(e.target.value))}
                    className="w-12 px-1.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-center"
                  />
                  <span className="w-16 text-right text-slate-500 dark:text-slate-400">
                    {l.book ? (l.book.price * l.quantity).toFixed(2) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-sm font-semibold pt-3 border-t-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white mb-4">
            <span>Order Total</span>
            <span>EGP {cartTotal.toFixed(2)}</span>
          </div>

          {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Order'}
          </button>
        </div>

        {result && <OrderResult result={result} />}
      </div>
    </div>
  )
}

function OrderResult({ result }) {
  if (result.status === 'rejected') {
    return (
      <div className="mt-4 bg-white dark:bg-slate-900 border-l-4 border-red-500 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-red-600 mb-2">Order Rejected</h3>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          {result.invalidLines.map((l, i) => (
            <li key={i}>{l.reason}</li>
          ))}
        </ul>
      </div>
    )
  }

  const statusColors = {
    validated: 'border-emerald-500 text-emerald-600',
    awaiting_stock: 'border-amber-500 text-amber-600',
  }

  return (
    <div className={`mt-4 bg-white dark:bg-slate-900 border-l-4 rounded-xl p-4 ${statusColors[result.status] || 'border-slate-400'}`}>
      <h3 className="text-sm font-semibold mb-2">
        Order #{result._id.slice(-6).toUpperCase()} — {result.status.replace('_', ' ')}
      </h3>
      <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-2">
        {result.items.map((i) => (
          <li key={i.isbn} className="flex justify-between">
            <span>{i.title} × {i.quantity}</span>
            <span>{i.lineStatus === 'ok' ? 'In stock' : 'Shortfall'}</span>
          </li>
        ))}
      </ul>
      {result.requisitions?.length > 0 && (
        <div className="mt-2 space-y-2">
          {result.requisitions.map((r, i) => (
            <div key={i} className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-2 text-[11px]">
              <strong className="block text-amber-700 dark:text-amber-400 mb-1">
                Requisition — {r.publisher}
              </strong>
              {r.items.map((it) => (
                <div key={it.isbn}>{it.title}: {it.quantity} units</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
