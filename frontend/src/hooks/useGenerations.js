import { useState, useEffect, useCallback } from 'react'
import {
  listGenerations,
  createGeneration as apiCreate,
  deleteGeneration as apiDelete,
} from '../api/generations'

export function useGenerations() {
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchGenerations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await listGenerations()
      setGenerations(data)
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
    setGenerations((prev) => prev.filter((g) => g.id !== id))
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
