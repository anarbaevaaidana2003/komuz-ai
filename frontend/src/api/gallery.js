import api from './client'

export const getGallery = () => api.get('/api/v1/gallery/')

export const toggleLike = (id) => api.post(`/api/v1/gallery/${id}/like`)

export const uploadToGallery = (file, prompt) => {
  const form = new FormData()
  form.append('file', file)
  form.append('prompt', prompt)
  return api.post('/api/v1/gallery/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
