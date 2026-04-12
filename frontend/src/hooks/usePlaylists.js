import { useState, useEffect, useCallback } from 'react'
import { listPlaylists, createPlaylist as apiCreate, addToPlaylist as apiAdd } from '../api/playlists'

export function usePlaylists() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlaylists = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await listPlaylists()
      setPlaylists(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  async function createPlaylist(name, description = '') {
    const { data } = await apiCreate(name, description)
    setPlaylists((prev) => [data, ...prev])
    return data
  }

  async function addToPlaylist(playlistId, generationId) {
    await apiAdd(playlistId, generationId)
  }

  return { playlists, loading, error, createPlaylist, addToPlaylist, refetch: fetchPlaylists }
}
