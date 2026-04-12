import api from './client'

export const createPlaylist = (name, description) =>
  api.post('/api/v1/playlists/', { name, description })

export const listPlaylists = () => api.get('/api/v1/playlists/')

export const addToPlaylist = (playlistId, generationId) =>
  api.post(`/api/v1/playlists/${playlistId}/add`, { generation_id: generationId })
