import api from './client'

export const getGallery = () => api.get('/api/v1/gallery/')

export const toggleLike = (id) => api.post(`/api/v1/gallery/${id}/like`)
