import { useState, useEffect, useCallback } from 'react'
import { listPlaylists, createPlaylist as apiCreate, addToPlaylist as apiAdd } from '../api/playlists'
import { cacheGet, cacheSet } from '../utils/cache'

const CACHE_KEY = 'cache:playlists'

export function usePlaylists() {
  const [playlists, setPlaylists] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(playlists.length === 0)
  const [error, setError] = useState(null)

  const fetchPlaylists = useCallback(async () => {
    if (playlists.length === 0) setLoading(true)
    setError(null)
    try {
      const { data } = await listPlaylists()
      setPlaylists(data)
      cacheSet(CACHE_KEY, data)
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
    setPlaylists((prev) => {
      const next = [data, ...prev]
      cacheSet(CACHE_KEY, next)
      return next
    })
    return data
  }

  async function addToPlaylist(playlistId, generationId) {
    await apiAdd(playlistId, generationId)
  }

  return { playlists, loading, error, createPlaylist, addToPlaylist, refetch: fetchPlaylists }
}
