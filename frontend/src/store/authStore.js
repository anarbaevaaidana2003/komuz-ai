import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login(user, accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  setUser(user) {
    set({ user })
  },

  setAccessToken(token) {
    localStorage.setItem('access_token', token)
    set({ accessToken: token, isAuthenticated: true })
  },
}))

export default useAuthStore
