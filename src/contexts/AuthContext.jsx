import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

// Create Auth Context
const AuthContext = createContext(null)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use Auth Context
export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}
