import { useState, useEffect, useRef } from 'react'
import { getGallery, toggleLike, uploadToGallery } from '../api/gallery'
import GenerationCard from '../components/GenerationCard'
import LoadingWave from '../components/LoadingWave'
import useAuthStore from '../store/authStore'
import { cacheGet, cacheSet } from '../utils/cache'

const CACHE_KEY = 'cache:gallery'

export default function Gallery() {
  const [generations, setGenerations] = useState(() => cacheGet(CACHE_KEY) || [])
  const [loading, setLoading] = useState(generations.length === 0)
  const { isAuthenticated } = useAuthStore()

  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPrompt, setUploadPrompt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    getGallery()
      .then(({ data }) => { setGenerations(data); cacheSet(CACHE_KEY, data) })
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

  async function handleUpload(e) {
    e.preventDefault()
    if (!uploadFile || !uploadPrompt.trim()) return
    setUploading(true)
    setUploadError('')
    try {
      const { data } = await uploadToGallery(uploadFile, uploadPrompt.trim())
      setGenerations((prev) => [data, ...prev])
      setShowUpload(false)
      setUploadFile(null)
      setUploadPrompt('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Жүктөө катасы')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Галерея</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
              Коомчулуктун жалпыга жеткиликтүү обондору — популярдуулук боюнча сорттолгон
            </p>
          </div>
          {isAuthenticated && (
            <button className="btn btn-primary" onClick={() => setShowUpload((v) => !v)}>
              {showUpload ? '✕ Жабуу' : '↑ Аудио жүктөө'}
            </button>
          )}
        </header>

        {showUpload && (
          <form
            onSubmit={handleUpload}
            className="card"
            style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}
          >
            <h3 style={{ marginBottom: 4 }}>Галереяга аудио жүктөө</h3>
            <div>
              <label className="form-label">WAV же MP3 файл</label>
              <input
                ref={fileRef}
                type="file"
                accept="audio/wav,audio/mp3,audio/mpeg,.wav,.mp3"
                className="form-input"
                style={{ paddingTop: 8, paddingBottom: 8 }}
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
                required
              />
            </div>
            <div>
              <label className="form-label">Сүрөттөмө (обондун аты же стили)</label>
              <input
                type="text"
                className="form-input"
                placeholder="мис: Жалал-Абад стилиндеги элдик обон"
                value={uploadPrompt}
                onChange={(e) => setUploadPrompt(e.target.value)}
                maxLength={200}
                required
              />
            </div>
            {uploadError && <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{uploadError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Жүктөлүүдө...' : 'Галереяга жарыялоо'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>
                Жок кылуу
              </button>
            </div>
          </form>
        )}

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
