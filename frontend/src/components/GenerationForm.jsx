import { useState } from 'react'
import LoadingWave from './LoadingWave'

const PROMPT_EXAMPLES = [
  'Традиционная мелодия комуза в духе эпоса Манас',
  'Медитативный наигрыш на комузе, вечерний степной ветер',
  'Быстрая танцевальная мелодия, свадебное торжество',
  'Печальная баллада пастуха в горах Тянь-Шань',
]

export default function GenerationForm({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(15)
  const [isPublic, setIsPublic] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    await onGenerate(prompt.trim(), duration, isPublic)
    setPrompt('')
  }

  return (
    <form className="gen-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label className="form-label">Описание мелодии</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите желаемую мелодию на русском или кыргызском..."
          required
          disabled={loading}
        />
      </div>

      <div className="gen-form__examples">
        {PROMPT_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="gen-form__example"
            onClick={() => setPrompt(ex)}
            disabled={loading}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">
          Длительность: <strong style={{ color: 'var(--primary)' }}>{duration}с</strong>
        </label>
        <input
          type="range"
          className="slider"
          min={5}
          max={60}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={loading}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>5с</span><span>30с</span><span>60с</span>
        </div>
      </div>

      <label className="gen-form__public-toggle">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          disabled={loading}
        />
        <span>Сделать публичным (появится в галерее)</span>
      </label>

      {loading ? (
        <LoadingWave text="Генерируем мелодию комуза..." />
      ) : (
        <button type="submit" className="btn btn-primary btn-lg" disabled={!prompt.trim()}>
          ✦ Создать мелодию
        </button>
      )}
    </form>
  )
}
