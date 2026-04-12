import usePlayerStore from '../store/playerStore'
import './GenerationCard.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GenerationCard({ generation, onDelete, showDelete = false }) {
  const { play, addToQueue, currentTrack, isPlaying } = usePlayerStore()
  const isCurrentTrack = currentTrack?.id === generation.id
  const canPlay = generation.status === 'done' && generation.audio_url

  function handlePlay() {
    if (!canPlay) return
    addToQueue(generation)
    play(generation)
  }

  return (
    <div className={`gen-card ${isCurrentTrack ? 'gen-card--active' : ''}`}>
      <div className="gen-card__header">
        <span className={`badge badge-${generation.status}`}>{generation.status}</span>
        {generation.is_public && <span className="gen-card__public">публичный</span>}
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
          {isCurrentTrack && isPlaying ? '⏸ Пауза' : '▶ Слушать'}
        </button>

        {showDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete?.(generation.id)}>
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}
