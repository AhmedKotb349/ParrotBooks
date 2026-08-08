# Parrot Books — Frontend Only (no backend needed)

This is the React client with the API layer swapped out for an in-browser
mock (`src/services/api.js`) — no Node server, no database, nothing to
install or run except this one app. All your original book/customer data
is baked in as seed data, and every business rule (stock checks, purchase
requisitions grouped by publisher, invoice/payment matching, etc.) still
runs — just in your browser's memory instead of on a server.

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:5173** and log in with any of:

| Username | Password | Role |
|---|---|---|
| `admin` | `password123` | admin |
| `sales` | `password123` | sales |
| `warehouse` | `password123` | warehouse |
| `accounts` | `password123` | accounts |

## What's different from the full-stack version

- No `server/` folder needed at all for this to run.
- Data lives in `localStorage` — it survives page refreshes, but clears if
  you clear your browser storage or open a different browser/incognito
  window. There's no shared database across devices/tabs.
- Every screen and every business rule (order validation, stock shortfall
  → purchase requisition, picking ticket, despatch note, invoice
  auto-draft, cheque/remittance matching, bank deposit) works exactly the
  same as the full-stack version — it's the same logic, just running
  client-side in `src/services/api.js` instead of in Express controllers.

## Walking through it

1. Sign in as `sales` → Sales Orders → add books → Submit. Order more of a
   low-stock title (e.g. try ordering 20 of something) to see a purchase
   requisition appear.
2. Sign in as `warehouse` → Warehouse → Generate Picking Ticket → Shipping
   → Create Despatch Note.
3. Sign in as `accounts` → Invoices → Generate Invoice → Payments → select
   the invoice, enter the matching amount, Record Payment → Prepare Bank
   Deposit.

## If you want the real backend later

The full-stack version (Express + MongoDB) is unchanged and still in the
`server/` folder alongside this — this frontend-only mode is purely for
testing the UI without needing to run it. To switch back, restore the
original `src/services/api.js` (the one that calls the Express API via
axios) and run the server as documented in the root README.

## Responsive design

The whole UI adapts across phone / tablet / desktop:

- **Sidebar** becomes a slide-in drawer with a hamburger button below the
  `md` breakpoint (768px), and is a fixed sidebar above it.
- **Catalog grid**, **dashboard stat cards**, and the **sales-order layout**
  reflow their column count at each breakpoint (2 → 3 → 4 columns, or
  stacked → side-by-side) using Tailwind's responsive utility classes,
  which compile to real `@media` queries under the hood.
- **Tables** (Invoices, Admin) scroll horizontally on narrow screens
  instead of squeezing columns unreadably thin.
- **`src/index.css`** adds hand-written `@media` rules on top of that:
  base font-size scaling per breakpoint (phones/tablets/desktop), larger
  minimum tap targets on touch devices (`@media (hover: none)`), and a
  landscape-phone tweak that shrinks the sticky header when vertical
  space is tight.
