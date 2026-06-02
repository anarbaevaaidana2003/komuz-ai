import { useGenerations } from '../hooks/useGenerations'
import GenerationCard from '../components/GenerationCard'
import LoadingWave from '../components/LoadingWave'
import useAuthStore from '../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { generations, loading, deleteGeneration } = useGenerations()

  return (
    <main className="page">
      <div className="container">
        <header style={{ marginBottom: 40 }}>
          <h1>Менин тректерим</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Жалпы жаратуулар: <strong>{generations.length}</strong>
            {user && ` · ${user.username}`}
          </p>
        </header>

        {loading && generations.length === 0 ? (
          <LoadingWave text="Тректериңиз жүктөлүүдө..." />
        ) : generations.length === 0 ? (
          <div className="empty-state">
            <h3>Азырынча жаратуулар жок</h3>
            <p>Биринчи обонду түзүү үчүн «Түзүү» бетине өтүңүз</p>
          </div>
        ) : (
          <div className="grid-3">
            {generations.map((g) => (
              <GenerationCard
                key={g.id}
                generation={g}
                onDelete={deleteGeneration}
                showDelete
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
