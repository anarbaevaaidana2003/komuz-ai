import { useState } from 'react'
import GenerationForm from '../components/GenerationForm'
import GenerationCard from '../components/GenerationCard'
import { useGenerations } from '../hooks/useGenerations'
import '../components/GenerationForm.css'

export default function Generate() {
  const { generations, loading, createGeneration, deleteGeneration } = useGenerations()
  const [submitting, setSubmitting] = useState(false)
  const [lastCreated, setLastCreated] = useState(null)

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
                <h3 style={{ marginBottom: 12, color: 'var(--accent-gold)' }}>Жаңы эле түзүлдү</h3>
                <GenerationCard generation={lastCreated} />
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
