import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import SalesOrders from './pages/sales-orders/SalesOrders.jsx'
import Warehouse from './pages/warehouse/Warehouse.jsx'
import Shipping from './pages/shipping/Shipping.jsx'
import Invoices from './pages/invoices/Invoices.jsx'
import Payments from './pages/payments/Payments.jsx'
import Admin from './pages/admin/Admin.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales-orders" element={<ProtectedRoute roles={['admin', 'sales']}><SalesOrders /></ProtectedRoute>} />
              <Route path="/warehouse" element={<ProtectedRoute roles={['admin', 'warehouse']}><Warehouse /></ProtectedRoute>} />
              <Route path="/shipping" element={<ProtectedRoute roles={['admin', 'warehouse']}><Shipping /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute roles={['admin', 'accounts']}><Invoices /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute roles={['admin', 'accounts']}><Payments /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
