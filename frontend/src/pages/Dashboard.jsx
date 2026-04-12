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
          <h1>Мои треки</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Всего генераций: <strong>{generations.length}</strong>
            {user && ` · ${user.username}`}
          </p>
        </header>

        {loading && generations.length === 0 ? (
          <LoadingWave text="Загружаем ваши треки..." />
        ) : generations.length === 0 ? (
          <div className="empty-state">
            <h3>Ещё нет генераций</h3>
            <p>Перейдите на страницу &laquo;Создать&raquo;, чтобы создать первую мелодию</p>
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
