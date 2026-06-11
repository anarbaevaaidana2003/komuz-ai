import { useState, useEffect, useCallback } from 'react'
import {
  listGenerations,
  createGeneration as apiCreate,
  deleteGeneration as apiDelete,
} from '../api/generations'
import { cacheGet, cacheSet, cacheClear } from '../utils/cache'

const CACHE_KEY = 'cache:generations'

export function useGenerations() {
  const [generations, setGenerations] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(generations.length === 0)
  const [error, setError] = useState(null)

  const fetchGenerations = useCallback(async () => {
    if (generations.length === 0) setLoading(true)
    setError(null)
    try {
      const { data } = await listGenerations()
      setGenerations(data)
      cacheSet(CACHE_KEY, data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGenerations()
  }, [fetchGenerations])

  async function createGeneration(prompt, duration, isPublic = false) {
    const { data } = await apiCreate(prompt, duration, isPublic)
    setGenerations((prev) => [data, ...prev])
    return data
  }

  async function deleteGeneration(id) {
    await apiDelete(id)
    setGenerations((prev) => {
      const next = prev.filter((g) => g.id !== id)
      cacheSet(CACHE_KEY, next)
      return next
    })
  }

  // Polling: обновляем статус pending/processing генераций
  useEffect(() => {
    const hasPending = generations.some(
      (g) => g.status === 'pending' || g.status === 'processing',
    )
    if (!hasPending) return

    const timer = setInterval(fetchGenerations, 3000)
    return () => clearInterval(timer)
  }, [generations, fetchGenerations])

  return { generations, loading, error, createGeneration, deleteGeneration, refetch: fetchGenerations }
}
