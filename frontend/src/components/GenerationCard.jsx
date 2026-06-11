import { useState } from 'react'
import usePlayerStore from '../store/playerStore'
import { usePlaylists } from '../hooks/usePlaylists'
import useAuthStore from '../store/authStore'
import './GenerationCard.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ky-KG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GenerationCard({ generation, onDelete, showDelete = false }) {
  const { play, addToQueue, currentTrack, isPlaying } = usePlayerStore()
  const { isAuthenticated } = useAuthStore()
  const { playlists, addToPlaylist } = usePlaylists()
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [added, setAdded] = useState(false)

  const isCurrentTrack = currentTrack?.id === generation.id
  const canPlay = generation.status === 'done' && generation.audio_url

  function handlePlay() {
    if (!canPlay) return
    addToQueue(generation)
    play(generation)
  }

  async function handleAddToPlaylist(playlistId) {
    try {
      await addToPlaylist(playlistId, generation.id)
      setAdded(true)
      setShowPlaylists(false)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      // already in playlist or other error — ignore
    }
  }

  return (
    <div className={`gen-card ${isCurrentTrack ? 'gen-card--active' : ''}`}>
      <div className="gen-card__header">
        <span className={`badge badge-${generation.status}`}>{generation.status}</span>
        {generation.is_public && <span className="gen-card__public">жалпыга жеткиликтүү</span>}
      </div>

      <p className="gen-card__prompt">&ldquo;{generation.prompt}&rdquo;</p>

      <div className="gen-card__meta">
        <span>{generation.duration}с</span>
        <span>·</span>
        <span>{formatDate(generation.created_at)}</span>
        {generation.likes_count > 0 && (
          <>
            <span>·</span>
            <span>♥ {generation.likes_count}</span>
          </>
        )}
      </div>

      <div className="gen-card__actions">
        <button
          className={`btn btn-sm ${canPlay ? 'btn-primary' : 'btn-outline'}`}
          onClick={handlePlay}
          disabled={!canPlay}
        >
          {isCurrentTrack && isPlaying ? '⏸ Токтотуу' : '▶ Угуу'}
        </button>

        {isAuthenticated && canPlay && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowPlaylists((v) => !v)}
            >
              {added ? '✓ Кошулду' : '+ Плейлист'}
            </button>

            {showPlaylists && (
              <div className="playlist-dropdown">
                {playlists.length === 0 ? (
                  <div className="playlist-dropdown__empty">Плейлист жок</div>
                ) : (
                  playlists.map((p) => (
                    <button
                      key={p.id}
                      className="playlist-dropdown__item"
                      onClick={() => handleAddToPlaylist(p.id)}
                    >
                      ♫ {p.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {canPlay && (
          <a
            className="btn btn-sm btn-outline"
            href={generation.audio_url}
            download={`komuz-${generation.id.slice(0, 8)}.wav`}
            aria-label="Жүктөп алуу"
          >
            ↓ Жүктөп алуу
          </a>
        )}

        {showDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(generation.id)}>
            Өчүрүү
          </button>
        )}
      </div>
    </div>
  )
}
