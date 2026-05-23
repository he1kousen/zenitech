import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthContext } from './contexts/AuthContext'
import LoadingScreen from './components/ui/LoadingScreen'
import GlobalNav from './components/store/GlobalNav'
import CartDrawer from './components/store/CartDrawer'
import PageTransition from './components/ui/PageTransition'

// Eager-loaded: AdminLayout dipakai sebagai wrapper di AdminRoute, harus tersedia segera.
import AdminLayout from './components/admin/AdminLayout'

// Lazy-loaded pages
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, role, loading } = useAuthContext()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/" replace />
  return <AdminLayout>{children}</AdminLayout>
}

function ConditionalNav() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register'
  if (hideNav) return null
  return <GlobalNav />
}

function ConditionalCartDrawer() {
  const { pathname } = useLocation()
  const hide = pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register'
  if (hide) return null
  return <CartDrawer />
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
        <Route path="/products/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><PageTransition><OrderSuccess /></PageTransition></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageTransition><Orders /></PageTransition></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><PageTransition><OrderDetail /></PageTransition></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><PageTransition><Dashboard /></PageTransition></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><PageTransition><Dashboard /></PageTransition></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><PageTransition><AdminProducts /></PageTransition></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><PageTransition><AdminOrders /></PageTransition></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><PageTransition><AdminCategories /></PageTransition></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <ConditionalNav />
      <ConditionalCartDrawer />
      <Suspense fallback={<LoadingScreen />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
