import { useState } from 'react'
import { usePlaylists } from '../hooks/usePlaylists'
import PlaylistCard from '../components/PlaylistCard'
import LoadingWave from '../components/LoadingWave'

export default function Playlists() {
  const { playlists, loading, createPlaylist } = usePlaylists()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await createPlaylist(name.trim(), description.trim())
      setName('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка создания')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Мои плейлисты</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Создавайте коллекции мелодий</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Отмена' : '+ Новый плейлист'}
          </button>
        </header>

        {showForm && (
          <div className="card" style={{ marginBottom: 32, maxWidth: 480 }}>
            <h3 style={{ marginBottom: 20 }}>Новый плейлист</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Название</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Мои любимые мелодии"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Описание (необязательно)</label>
                <input
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Создание...' : 'Создать'}
              </button>
            </form>
          </div>
        )}

        {loading && playlists.length === 0 ? (
          <LoadingWave text="Загружаем плейлисты..." />
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <h3>Нет плейлистов</h3>
            <p>Создайте первый плейлист для организации ваших мелодий</p>
          </div>
        ) : (
          <div className="grid-3">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
