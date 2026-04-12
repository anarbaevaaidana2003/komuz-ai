import api from './client'

export const createGeneration = (prompt, duration, isPublic = false) =>
  api.post('/api/v1/generations/', { prompt, duration, is_public: isPublic })

export const listGenerations = () => api.get('/api/v1/generations/')

export const getGeneration = (id) => api.get(`/api/v1/generations/${id}`)

export const deleteGeneration = (id) => api.delete(`/api/v1/generations/${id}`)
