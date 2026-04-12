import api from './client'

export const register = (email, username, password) =>
  api.post('/api/v1/auth/register', { email, username, password })

export const login = (email, password) =>
  api.post('/api/v1/auth/login', { email, password })

export const getMe = () => api.get('/api/v1/auth/me')
