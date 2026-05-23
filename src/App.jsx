import { AuthProvider } from './contexts/AuthContext'
import Router from './router'
import ToastViewport from './components/ui/Toast'
import { useLenis } from './hooks/useLenis'
import './index.css'

function App() {
  useLenis() // Initialize global smooth scroll

  return (
    <AuthProvider>
      <Router />
      <ToastViewport />
    </AuthProvider>
  )
}

export default App
