import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth'

export function useAuth() {
  const store = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiLogin(email, password)
      store.login(data.user, data.access_token, data.refresh_token)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка входа'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function register(email, username, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiRegister(email, username, password)
      store.login(data.user, data.access_token, data.refresh_token)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ошибка регистрации'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile() {
    try {
      const { data } = await getMe()
      store.setUser(data)
    } catch {
      store.logout()
    }
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: store.logout,
    loadProfile,
  }
}
