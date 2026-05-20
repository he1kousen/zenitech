import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'
import LoadingScreen from './components/ui/LoadingScreen'
import GlobalNav from './components/store/GlobalNav'
import CartDrawer from './components/store/CartDrawer'

// Eager-loaded: AdminLayout dipakai sebagai wrapper di AdminRoute, harus tersedia segera.
import AdminLayout from './components/admin/AdminLayout'

// Lazy-loaded pages — code-split per route untuk bundle yang lebih kecil.
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))

// Protected Route - requires authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Admin Route - requires admin role + wrap dengan AdminLayout
function AdminRoute({ children }) {
  const { user, role, loading } = useAuthContext()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

// GlobalNav muncul di semua halaman kecuali admin & auth pages
function ConditionalNav() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register'
  if (hideNav) return null
  return <GlobalNav />
}

// CartDrawer di-render di luar Routes, di-mount sekali, kontrol via Zustand isOpen.
// Di-hide di halaman admin & auth — sama seperti GlobalNav.
function ConditionalCartDrawer() {
  const { pathname } = useLocation()
  const hide = pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register'
  if (hide) return null
  return <CartDrawer />
}

export default function Router() {
  return (
    <BrowserRouter>
      <ConditionalNav />
      <ConditionalCartDrawer />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - require authentication */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - require admin role */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
