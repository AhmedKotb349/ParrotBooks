import { useEffect, useState } from 'react'
import { getBooks, getCustomers } from '../../services/api.js'

export default function Admin() {
  const [books, setBooks] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    getBooks().then(setBooks)
    getCustomers().then(setCustomers)
  }, [])

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">Admin</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Catalogue and customer overview (FR29 — maintenance actions run against the API directly for now).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catalogue ({books.length})</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Title</th>
                  <th className="text-left px-3 py-2">Category</th>
                  <th className="text-left px-3 py-2">Price</th>
                  <th className="text-left px-3 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{b.title}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{b.category}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">EGP {b.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{b.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Customers ({customers.length})</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{c.name}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{c.email}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
