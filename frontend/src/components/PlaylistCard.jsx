import { useState } from 'react'
import { getPlaylistTracks } from '../api/playlists'
import usePlayerStore from '../store/playerStore'
import './PlaylistCard.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlaylistCard({ playlist }) {
  const [open, setOpen] = useState(false)
  const [tracks, setTracks] = useState(null)
  const [loading, setLoading] = useState(false)
  const { play, currentTrack, isPlaying } = usePlayerStore()

  async function handleToggle() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (tracks !== null) return
    setLoading(true)
    try {
      const res = await getPlaylistTracks(playlist.id)
      setTracks(res.data)
    } catch {
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  function handlePlayTrack(track) {
    if (!track.audio_url) return
    play(track)
  }

  return (
    <div className={`playlist-card ${open ? 'playlist-card--open' : ''}`}>
      <div className="playlist-card__header" onClick={handleToggle}>
        <div className="playlist-card__icon">♫</div>
        <div className="playlist-card__info">
          <h3 className="playlist-card__name">{playlist.name}</h3>
          {playlist.description && (
            <p className="playlist-card__desc">{playlist.description}</p>
          )}
          <p className="playlist-card__date">Создан {formatDate(playlist.created_at)}</p>
        </div>
        <span className="playlist-card__chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="playlist-card__tracks">
          {loading && <p className="playlist-card__hint">Жүктөлүүдө...</p>}

          {!loading && tracks !== null && tracks.length === 0 && (
            <p className="playlist-card__hint">Бул плейлистте треклер жок</p>
          )}

          {!loading && tracks && tracks.map((track) => {
            const isActive = currentTrack?.id === track.id && isPlaying
            return (
              <div
                key={track.id}
                className={`playlist-track ${isActive ? 'playlist-track--active' : ''}`}
                onClick={() => handlePlayTrack(track)}
                title={track.audio_url ? '' : 'Аудио жок'}
              >
                <span className="playlist-track__play">
                  {isActive ? '▐▐' : '▶'}
                </span>
                <span className="playlist-track__prompt">{track.prompt}</span>
                <span className="playlist-track__meta">{formatDuration(track.duration)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
