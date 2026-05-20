import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  // Get user role from JWT app_metadata (set via Supabase Dashboard or admin SQL).
  // Pattern ini menghindari query ke public.users yang bisa kena RLS recursion.
  const getRoleFromUser = (user) => {
    return user?.app_metadata?.role || null
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Login error:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Register new user
  const register = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Register error:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Google login error:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setRole(null)

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Subscribe to auth state changes
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          setRole(getRoleFromUser(session.user))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setRole(getRoleFromUser(session.user))
        } else {
          setUser(null)
          setRole(null)
        }
        setLoading(false)
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    role,
    login,
    register,
    loginWithGoogle,
    logout,
  }
}
