import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import './Home.css'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <main className="home-page page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__badge">✦ Фаза 1 — Mock AI активдүү</div>
          <h1 className="hero__title">
            Комуздун музыкасы,<br />
            <em>AI жараткан</em>
          </h1>
          <p className="hero__subtitle">
            Кыргызстандын материалдык эмес маданий мурасынын салтында ыр обондорун түзүңүз.
            Каалаган маанайыңызды сүрөттөңүз — AI комузда уникалдуу обон жаратат.
          </p>
          <div className="hero__actions">
            {isAuthenticated ? (
              <Link to="/generate" className="btn btn-primary btn-lg">
                ✦ Обон түзүү
              </Link>
            ) : (
              <Link to="/" state={{ openAuth: true }} className="btn btn-primary btn-lg">
                ✦ Баштоо — бул бекер
              </Link>
            )}
            <Link to="/gallery" className="btn btn-outline-light btn-lg">
              Галереяны угуу
            </Link>
          </div>
        </div>

        {/* Шырдак-бордер снизу hero */}
        <div className="hero__border">
          <div className="shyrdak-border" />
        </div>

        {/* Орнамент тюндюка */}
        <div className="hero__ornament" aria-hidden="true">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" opacity="0.06">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            {[0,45,90,135,180,225,270,315].map((deg) => {
              const rad = (deg * Math.PI) / 180
              return (
                <line
                  key={deg}
                  x1={100 + 20 * Math.cos(rad)}
                  y1={100 + 20 * Math.sin(rad)}
                  x2={100 + 80 * Math.cos(rad)}
                  y2={100 + 80 * Math.sin(rad)}
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              )
            })}
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="ornament">✦</div>
          <h2 className="section-title">Бул кандайча иштейт</h2>
          <div className="features__grid">
            <div className="feature-card">
              <div className="feature-card__num">01</div>
              <h3>Обонду сүрөттөңүз</h3>
              <p>Музыканын кандай маанайда, темпте же образда болушун каалаганыңызды айтыңыз. Кыргызча же орусча.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__num">02</div>
              <h3>AI жаратат</h3>
              <p>Комуздун жазуулары менен үйрөтүлгөн MusicGen модели бир нече секундда уникалдуу аудиофайл жаратат.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__num">03</div>
              <h3>Сактаңыз жана бөлүшүңүз</h3>
              <p>Плейлисттер түзүңүз, тректерди галереяга жарыялаңыз, коомчулуктун эң жакшы чыгармаларына лайк коюңуз.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Komuz */}
      <section className="komuz-section">
        <div className="container">
          <div className="komuz-section__inner">
            <div className="komuz-section__text">
              <h2>Комуз — Кыргызстандын жаны</h2>
              <p>
                Комуз — Борбордук Азиядагы эң байыркы чертме аспаптардын бири, үч кылдуу аспап.
                Анын үнү манасчылардын эпикалык жомоктору менен талаа салттарын миңдеген жылдар бою
                коштоп келген. 2017-жылы ЮНЕСКО комузда ойноо өнөрүн материалдык эмес
                маданий мурастардын тизмесине киргизген.
              </p>
              <Link to="/about" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-flex' }}>
                Көбүрөөк билүү →
              </Link>
            </div>
            <div className="komuz-section__visual" aria-hidden="true">
              <div className="komuz-strings">
                {[1,2,3,4,5].map((i) => (
                  <span key={i} className="komuz-strings__line" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
