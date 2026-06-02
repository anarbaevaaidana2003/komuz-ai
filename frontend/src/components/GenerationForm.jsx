import { useState } from 'react'
import LoadingWave from './LoadingWave'

const PROMPT_EXAMPLES = [
  'Манас эпосунун рухундагы комуздун салттуу обону',
  'Комуздагы медитативдик обон, кечки талаа шамалы',
  'Тез бийлик обону, той маарекеси',
  'Тянь-Шань тоолорундагы чабандын кайгылуу баллады',
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
        <label className="form-label">Обондун сүрөттөмөсү</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Каалаган обонду кыргызча же орусча сүрөттөңүз..."
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
          Узактыгы: <strong style={{ color: 'var(--primary)' }}>{duration}с</strong>
        </label>
        <input
          type="range"
          className="slider"
          min={5}
          max={25}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={loading}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>5с</span><span>15с</span><span>25с</span>
        </div>
      </div>

      <label className="gen-form__public-toggle">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          disabled={loading}
        />
        <span>Жалпыга жеткиликтүү кылуу (галереяда пайда болот)</span>
      </label>

      {loading ? (
        <LoadingWave text="Комуздун обону жаратылууда..." />
      ) : (
        <button type="submit" className="btn btn-primary btn-lg" disabled={!prompt.trim()}>
          ✦ Обон түзүү
        </button>
      )}
    </form>
  )
}
