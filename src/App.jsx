import { AuthProvider } from './contexts/AuthContext'
import Router from './router'
import ToastViewport from './components/ui/Toast'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router />
      <ToastViewport />
    </AuthProvider>
  )
}

export default App
