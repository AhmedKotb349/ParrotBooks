// ============================================================================
// Mock, browser-only data layer. No backend, no network calls — everything
// lives in memory (persisted to localStorage so a page refresh doesn't wipe
// your test data). This lets you run and click through the whole frontend
// with just `npm run dev` in client/, nothing else.
//
// Every exported function here has the exact same name and signature the
// pages already call, so no page component needed to change.
// ============================================================================

const DELAY = 150 // ms — small artificial delay so loading states are visible

function wait(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY))
}

function genId() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function cover(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}

// ---- Seed data (exactly what was supplied, images swapped to a real, ---
// ---- working cover API keyed by each book's real ISBN) -----------------
const SEED_BOOKS = [
  { title: 'Clean Code', isbn: '9780132350884', category: 'Programming', price: 45, stock: 120, publisher: 'Prentice Hall', author: 'Robert C. Martin' },
  { title: 'Introduction to Algorithms', isbn: '9780262033848', category: 'Computer Science', price: 90, stock: 80, publisher: 'MIT Press', author: 'Cormen, Leiserson, Rivest, Stein' },
  { title: 'The Pragmatic Programmer', isbn: '9780201616224', category: 'Programming', price: 50, stock: 100, publisher: 'Addison-Wesley', author: 'David Thomas & Andrew Hunt' },
  { title: 'Atomic Habits', isbn: '9780735211292', category: 'Self Development', price: 30, stock: 200, publisher: 'Penguin', author: 'James Clear' },
  { title: 'Deep Work', isbn: '9781455586691', category: 'Productivity', price: 28, stock: 150, publisher: 'Grand Central', author: 'Cal Newport' },
  { title: 'Rich Dad Poor Dad', isbn: '9781612680194', category: 'Finance', price: 25, stock: 300, publisher: 'Plata Publishing', author: 'Robert T. Kiyosaki' },
  { title: "Harry Potter and the Sorcerer's Stone", isbn: '9780590353427', category: 'Fiction', price: 20, stock: 500, publisher: 'Scholastic', author: 'J.K. Rowling' },
  { title: 'The Alchemist', isbn: '9780061122415', category: 'Fiction', price: 18, stock: 250, publisher: 'HarperOne', author: 'Paulo Coelho' },
  { title: 'Thinking, Fast and Slow', isbn: '9780374533557', category: 'Psychology', price: 35, stock: 130, publisher: 'Farrar, Straus and Giroux', author: 'Daniel Kahneman' },
  { title: 'Zero to One', isbn: '9780804139298', category: 'Startup', price: 27, stock: 170, publisher: 'Crown Business', author: 'Peter Thiel' },
].map((b) => ({ ...b, _id: genId(), image: cover(b.isbn) }))

const SEED_CUSTOMERS = [
  { name: 'Ahmed Ali', email: 'ahmed@test.com', address: 'Cairo, Egypt' },
  { name: 'Sara Mohamed', email: 'sara@test.com', address: 'Alexandria, Egypt' },
].map((c) => ({ ...c, _id: genId() }))

const SEED_USERS = [
  { username: 'admin', password: 'password123', fullName: 'Amira Admin', role: 'admin' },
  { username: 'sales', password: 'password123', fullName: 'Sara Sales', role: 'sales' },
  { username: 'warehouse', password: 'password123', fullName: 'Wael Warehouse', role: 'warehouse' },
  { username: 'accounts', password: 'password123', fullName: 'Karim Accounts', role: 'accounts' },
]

// ---- Persisted mutable state (orders/dispatches/invoices/payments/deposits) ----
const STORAGE_KEY = 'pb_mock_db_v1'

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Books/customers always come from the fixed seed (so edits to seed data
      // in this file take effect on reload); everything else persists.
      return {
        books: SEED_BOOKS,
        customers: SEED_CUSTOMERS,
        orders: parsed.orders || [],
        dispatches: parsed.dispatches || [],
        invoices: parsed.invoices || [],
        payments: parsed.payments || [],
        bankDeposits: parsed.bankDeposits || [],
      }
    }
  } catch {
    /* fall through to fresh state */
  }
  return {
    books: SEED_BOOKS,
    customers: SEED_CUSTOMERS,
    orders: [],
    dispatches: [],
    invoices: [],
    payments: [],
    bankDeposits: [],
  }
}

const db = loadDb()

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      orders: db.orders,
      dispatches: db.dispatches,
      invoices: db.invoices,
      payments: db.payments,
      bankDeposits: db.bankDeposits,
    })
  )
}

// ---- Auth ----
export function login(username, password) {
  const record = SEED_USERS.find((u) => u.username === username)
  if (!record || record.password !== password) {
    const err = new Error('Invalid username or password')
    err.response = { data: { error: 'Invalid username or password' } }
    return Promise.reject(err)
  }
  return wait({
    token: 'mock-token-' + username,
    user: { username: record.username, fullName: record.fullName, role: record.role },
  })
}

// ---- Books / catalogue ----
export function getBooks() {
  return wait(db.books)
}

export function getRelatedBooks(bookId) {
  const book = db.books.find((b) => b._id === bookId)
  if (!book) return wait([])
  const related = db.books.filter((b) => b.category === book.category && b._id !== bookId)
  const shuffled = related.sort(() => Math.random() - 0.5).slice(0, 4)
  return wait(shuffled)
}

// ---- Customers ----
export function getCustomers() {
  return wait(db.customers)
}

// ---- Orders ----
// Mirrors the server's business logic: validation, extended price/total,
// stock check, purchase requisitions grouped by publisher, stock decrement.
export function createOrder({ customerId, items }) {
  const customer = db.customers.find((c) => c._id === customerId)
  if (!customer) {
    const err = new Error('Unknown customer')
    err.response = { data: { error: 'Unknown customer' } }
    return Promise.reject(err)
  }

  const validatedLines = items.map((item) => {
    const book = db.books.find((b) => b._id === item.bookId)
    if (!book) return { valid: false, reason: 'Book not found in catalogue' }
    if (!item.quantity || item.quantity <= 0) return { valid: false, reason: 'Quantity must be greater than zero' }
    return { valid: true, book, quantity: item.quantity, price: book.price, extendedPrice: book.price * item.quantity }
  })

  const invalidLines = validatedLines.filter((l) => !l.valid)
  if (invalidLines.length > 0) {
    const err = new Error('Order rejected')
    err.response = { status: 422, data: { status: 'rejected', invalidLines } }
    return Promise.reject(err)
  }

  const shortfallLines = validatedLines.filter((l) => l.book.stock < l.quantity)
  const inStockLines = validatedLines.filter((l) => l.book.stock >= l.quantity)
  const total = validatedLines.reduce((sum, l) => sum + l.extendedPrice, 0)
  const status = shortfallLines.length > 0 ? 'awaiting_stock' : 'validated'

  const requisitions = []
  if (shortfallLines.length > 0) {
    const byPublisher = {}
    for (const line of shortfallLines) {
      const shortQty = line.quantity - line.book.stock
      if (!byPublisher[line.book.publisher]) byPublisher[line.book.publisher] = []
      byPublisher[line.book.publisher].push({ isbn: line.book.isbn, title: line.book.title, quantity: shortQty })
    }
    for (const publisher of Object.keys(byPublisher)) {
      requisitions.push({ publisher, items: byPublisher[publisher] })
    }
  }

  const order = {
    _id: genId(),
    customer: customer._id,
    customerName: customer.name,
    items: validatedLines.map((l) => ({
      book: l.book._id,
      isbn: l.book.isbn,
      title: l.book.title,
      quantity: l.quantity,
      price: l.price,
      extendedPrice: l.extendedPrice,
      lineStatus: l.book.stock >= l.quantity ? 'ok' : 'shortfall',
    })),
    total,
    status,
    requisitions,
    pickingTicket: null,
    createdAt: new Date().toISOString(),
  }

  inStockLines.forEach((l) => {
    l.book.stock -= l.quantity
  })

  db.orders.unshift(order)
  persist()
  return wait(order)
}

export function getOrders(status) {
  const list = status ? db.orders.filter((o) => o.status === status) : db.orders
  return wait(list)
}

export function getOrder(id) {
  return wait(db.orders.find((o) => o._id === id) || null)
}

export function generatePickingTicket(orderId) {
  const order = db.orders.find((o) => o._id === orderId)
  if (!order) {
    const err = new Error('Order not found')
    err.response = { data: { error: 'Order not found' } }
    return Promise.reject(err)
  }
  if (order.status !== 'validated') {
    const err = new Error('Invalid status')
    err.response = { data: { error: `Cannot generate a picking ticket for an order in status "${order.status}"` } }
    return Promise.reject(err)
  }
  order.pickingTicket = {
    generatedAt: new Date().toISOString(),
    items: order.items.filter((i) => i.lineStatus === 'ok').map((i) => ({ isbn: i.isbn, title: i.title, quantity: i.quantity })),
  }
  order.status = 'picked'
  persist()
  return wait(order)
}

// ---- Dispatch ----
export function getDispatches() {
  return wait(db.dispatches)
}

export function createDispatch(orderId, carrier) {
  const order = db.orders.find((o) => o._id === orderId)
  if (!order) {
    const err = new Error('Order not found')
    err.response = { data: { error: 'Order not found' } }
    return Promise.reject(err)
  }
  if (order.status !== 'picked') {
    const err = new Error('Invalid status')
    err.response = { data: { error: `Cannot dispatch an order in status "${order.status}"` } }
    return Promise.reject(err)
  }
  const dispatch = {
    _id: genId(),
    order: order._id,
    carrier: carrier || 'Standard Carrier',
    dispatchDate: new Date().toISOString(),
    items: order.pickingTicket.items,
  }
  db.dispatches.unshift(dispatch)
  order.status = 'shipped'
  persist()
  return wait(dispatch)
}

// ---- Invoices ----
export function getInvoices(status) {
  const list = status ? db.invoices.filter((i) => i.status === status) : db.invoices
  return wait(list)
}

export function createInvoice(dispatchId) {
  const dispatch = db.dispatches.find((d) => d._id === dispatchId)
  if (!dispatch) {
    const err = new Error('Dispatch not found')
    err.response = { data: { error: 'Dispatch not found' } }
    return Promise.reject(err)
  }
  const order = db.orders.find((o) => o._id === dispatch.order)
  const existing = db.invoices.find((i) => i.order === order._id)
  if (existing) {
    const err = new Error('Already invoiced')
    err.response = { data: { error: 'This order has already been invoiced' } }
    return Promise.reject(err)
  }
  const invoiceItems = order.items
    .filter((i) => i.lineStatus === 'ok')
    .map((i) => ({ isbn: i.isbn, title: i.title, quantity: i.quantity, price: i.price, extendedPrice: i.extendedPrice }))
  const totalAmount = invoiceItems.reduce((sum, i) => sum + i.extendedPrice, 0)

  const invoice = {
    _id: genId(),
    order: order._id,
    dispatch: dispatch._id,
    customer: order.customer,
    items: invoiceItems,
    totalAmount,
    status: 'unpaid',
    invoiceDate: new Date().toISOString(),
  }
  db.invoices.unshift(invoice)
  order.status = 'invoiced'
  persist()
  return wait(invoice)
}

// ---- Payments ----
export function getPayments() {
  return wait(db.payments)
}

export function recordPayment({ customerId, chequeAmount, invoiceIds }) {
  const invoices = db.invoices.filter((i) => invoiceIds.includes(i._id) && i.customer === customerId && i.status === 'unpaid')
  if (invoices.length !== invoiceIds.length) {
    const err = new Error('Invalid invoices')
    err.response = { data: { error: 'One or more invoices are invalid, already paid, or belong to a different customer' } }
    return Promise.reject(err)
  }
  const remittanceTotal = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const discrepancy = Math.abs(remittanceTotal - chequeAmount) > 0.01

  const payment = {
    _id: genId(),
    customer: customerId,
    chequeAmount,
    remittanceTotal,
    matchedInvoices: invoices.map((inv) => ({ invoice: inv._id, amountApplied: inv.totalAmount })),
    discrepancy,
    status: discrepancy ? 'pending_review' : 'matched',
    receivedAt: new Date().toISOString(),
    depositedInBankDeposit: null,
  }

  if (!discrepancy) {
    invoices.forEach((inv) => {
      inv.status = 'paid'
      const order = db.orders.find((o) => o._id === inv.order)
      if (order) order.status = 'paid'
    })
  }

  db.payments.unshift(payment)
  persist()
  return wait(payment)
}

export function prepareBankDeposit() {
  const unbanked = db.payments.filter((p) => !p.discrepancy && !p.depositedInBankDeposit)
  if (unbanked.length === 0) {
    const err = new Error('Nothing to deposit')
    err.response = { data: { error: 'No confirmed payments available to deposit today' } }
    return Promise.reject(err)
  }
  const totalAmount = unbanked.reduce((sum, p) => sum + p.chequeAmount, 0)
  const deposit = {
    _id: genId(),
    depositDate: new Date().toISOString(),
    payments: unbanked.map((p) => p._id),
    totalAmount,
  }
  unbanked.forEach((p) => {
    p.depositedInBankDeposit = deposit._id
  })
  db.bankDeposits.unshift(deposit)
  persist()
  return wait(deposit)
}

export function getBankDeposits() {
  const withPayments = db.bankDeposits.map((d) => ({
    ...d,
    payments: d.payments.map((pid) => db.payments.find((p) => p._id === pid)).filter(Boolean),
  }))
  return wait(withPayments)
}

// ---- Dashboard ----
export function getDashboardSummary() {
  const ordersByStatus = {}
  db.orders.forEach((o) => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1
  })
  const lowStockBooks = db.books.filter((b) => b.stock < 10).map((b) => ({ _id: b._id, title: b.title, stock: b.stock, category: b.category }))
  const unpaidInvoices = db.invoices.filter((i) => i.status === 'unpaid')
  const outstandingBalance = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const totalRevenue = db.invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)

  return wait({
    ordersByStatus,
    lowStockBooks,
    outstandingInvoiceCount: unpaidInvoices.length,
    outstandingBalance,
    customerCount: db.customers.length,
    totalRevenue,
  })
}
