import './PlaylistCard.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function PlaylistCard({ playlist }) {
  return (
    <div className="playlist-card">
      <div className="playlist-card__icon">♫</div>
      <div className="playlist-card__info">
        <h3 className="playlist-card__name">{playlist.name}</h3>
        {playlist.description && (
          <p className="playlist-card__desc">{playlist.description}</p>
        )}
        <p className="playlist-card__date">Создан {formatDate(playlist.created_at)}</p>
      </div>
    </div>
  )
}
