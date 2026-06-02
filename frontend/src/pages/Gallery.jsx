import { useState, useEffect } from 'react'
import { getGallery, toggleLike } from '../api/gallery'
import GenerationCard from '../components/GenerationCard'
import LoadingWave from '../components/LoadingWave'
import useAuthStore from '../store/authStore'

export default function Gallery() {
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    getGallery()
      .then(({ data }) => setGenerations(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleLike(id) {
    if (!isAuthenticated) return
    try {
      const { data } = await toggleLike(id)
      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, likes_count: data.likes_count } : g)),
      )
    } catch {}
  }

  return (
    <main className="page">
      <div className="container">
        <header style={{ marginBottom: 40 }}>
          <h1>Галерея</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Коомчулуктун жалпыга жеткиликтүү обондору — популярдуулук боюнча сорттолгон
          </p>
        </header>

        {loading ? (
          <LoadingWave text="Галерея жүктөлүүдө..." />
        ) : generations.length === 0 ? (
          <div className="empty-state">
            <h3>Галерея азырынча бош</h3>
            <p>Биринчи обонду түзүп, жарыялаңыз!</p>
          </div>
        ) : (
          <div className="grid-3">
            {generations.map((g) => (
              <div key={g.id} style={{ position: 'relative' }}>
                <GenerationCard generation={g} />
                {isAuthenticated && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 8, width: '100%' }}
                    onClick={() => handleLike(g.id)}
                  >
                    ♥ {g.likes_count} лайк
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
