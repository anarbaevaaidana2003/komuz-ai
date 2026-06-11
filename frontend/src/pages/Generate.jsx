import { useState, useEffect, useRef } from 'react'
import GenerationForm from '../components/GenerationForm'
import GenerationCard from '../components/GenerationCard'
import { useGenerations } from '../hooks/useGenerations'
import '../components/GenerationForm.css'

const STEPS = [
  { at: 0,   text: 'Суроо жөнөтүлдү...' },
  { at: 5,   text: 'HF Space ойгонуп жатат...' },
  { at: 20,  text: 'MusicGen моделы жүктөлүүдө...' },
  { at: 60,  text: 'Обон жаратылууда — бир аз күтүңүз...' },
  { at: 150, text: 'RVC: комуздун үнүнө которулуп жатат...' },
  { at: 240, text: 'Дээрлик бүттү...' },
]

function useElapsedTimer(active) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (active) {
      setElapsed(0)
      ref.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      clearInterval(ref.current)
      setElapsed(0)
    }
    return () => clearInterval(ref.current)
  }, [active])
  return elapsed
}

export default function Generate() {
  const { generations, loading, createGeneration, deleteGeneration } = useGenerations()
  const [submitting, setSubmitting] = useState(false)
  const [lastCreated, setLastCreated] = useState(null)

  const isProcessing = lastCreated && (lastCreated.status === 'pending' || lastCreated.status === 'processing')
  const currentGen = lastCreated && generations.find((g) => g.id === lastCreated.id)
  const isDone = currentGen?.status === 'done'

  const elapsed = useElapsedTimer(isProcessing && !isDone)
  const stepText = [...STEPS].reverse().find((s) => elapsed >= s.at)?.text || STEPS[0].text

  async function handleGenerate(prompt, duration, isPublic) {
    setSubmitting(true)
    try {
      const gen = await createGeneration(prompt, duration, isPublic)
      setLastCreated(gen)
    } catch (err) {
      alert(err.response?.data?.detail || 'Жаратуу катасы')
    } finally {
      setSubmitting(false)
    }
  }

  const recentGenerations = generations.slice(0, 5)

  return (
    <main className="page">
      <div className="container">
        <header style={{ marginBottom: 40 }}>
          <h1>Обон түзүү</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Каалаган обонду сүрөттөңүз — AI комузда уникалдуу обон жаратат
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          <div className="card">
            <GenerationForm onGenerate={handleGenerate} loading={submitting} />
          </div>

          <div>
            {lastCreated && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12 }}>
                  {isDone ? '✓ Обон даяр!' : '⏳ Жаратылууда...'}
                </h3>

                {!isDone && (
                  <div className="gen-progress-box">
                    <div className="gen-progress-step">{stepText}</div>
                    <div className="gen-progress-timer">
                      {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} өттү
                    </div>
                    <div className="gen-progress-bar">
                      <div
                        className="gen-progress-bar__fill"
                        style={{ width: `${Math.min((elapsed / 300) * 100, 95)}%` }}
                      />
                    </div>
                    <p className="gen-progress-hint">
                      AI генерация 3–6 мүнөт убакыт талап кылат — бул нормалдуу
                    </p>
                  </div>
                )}

                <GenerationCard generation={currentGen || lastCreated} />
              </div>
            )}

            {recentGenerations.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 12 }}>Акыркы жаратуулар</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentGenerations.map((g) => (
                    <GenerationCard
                      key={g.id}
                      generation={g}
                      onDelete={deleteGeneration}
                      showDelete
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
