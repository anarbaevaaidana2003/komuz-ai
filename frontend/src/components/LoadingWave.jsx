import './LoadingWave.css'

export default function LoadingWave({ text = 'Генерируем мелодию...' }) {
  return (
    <div className="loading-wave">
      <div className="loading-wave__bars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="loading-wave__bar" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      {text && <p className="loading-wave__text">{text}</p>}
    </div>
  )
}
