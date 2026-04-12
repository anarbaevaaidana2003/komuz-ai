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
          <div className="hero__badge">✦ Фаза 1 — Mock AI активна</div>
          <h1 className="hero__title">
            Музыка комуза,<br />
            <em>рождённая AI</em>
          </h1>
          <p className="hero__subtitle">
            Создавайте мелодии в традиции нематериального культурного наследия Кыргызстана.
            Опишите желаемое настроение — и AI сгенерирует уникальный наигрыш на комузе.
          </p>
          <div className="hero__actions">
            {isAuthenticated ? (
              <Link to="/generate" className="btn btn-primary btn-lg">
                ✦ Создать мелодию
              </Link>
            ) : (
              <Link to="/" state={{ openAuth: true }} className="btn btn-primary btn-lg">
                ✦ Начать — это бесплатно
              </Link>
            )}
            <Link to="/gallery" className="btn btn-outline-light btn-lg">
              Послушать галерею
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
          <h2 className="section-title">Как это работает</h2>
          <div className="features__grid">
            <div className="feature-card">
              <div className="feature-card__num">01</div>
              <h3>Опишите мелодию</h3>
              <p>Расскажите, какое настроение, темп или образ должна передавать музыка. На русском или кыргызском.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__num">02</div>
              <h3>AI генерирует</h3>
              <p>Модель MusicGen, дообученная на записях комуза, создаёт уникальный аудиофайл за несколько секунд.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__num">03</div>
              <h3>Сохраняйте и делитесь</h3>
              <p>Создавайте плейлисты, публикуйте треки в галерею, лайкайте лучшие работы сообщества.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Komuz */}
      <section className="komuz-section">
        <div className="container">
          <div className="komuz-section__inner">
            <div className="komuz-section__text">
              <h2>Комуз — душа Кыргызстана</h2>
              <p>
                Комуз — трёхструнный щипковый инструмент, один из древнейших в Центральной Азии.
                Его звучание сопровождало эпические сказания манасчи и степные обряды на протяжении
                тысячелетий. В 2019 году ЮНЕСКО включило искусство игры на комузе в список
                нематериального культурного наследия человечества.
              </p>
              <Link to="/about" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-flex' }}>
                Узнать больше →
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
