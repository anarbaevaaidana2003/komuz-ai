import './About.css'

export default function About() {
  return (
    <main className="page about-page">
      <div className="container about__inner">
        <header className="about__header">
          <h1>О проекте</h1>
          <p className="about__lead">
            Komuz-AI — платформа на стыке искусственного интеллекта и культурного наследия Кыргызстана
          </p>
        </header>

        <div className="about__grid">
          <section className="about__section">
            <h2>История комуза</h2>
            <p>
              Комуз — трёхструнный щипковый инструмент, один из древнейших в Центральной Азии.
              Его история насчитывает более трёх тысяч лет. Традиционно изготавливался из цельного
              дерева — абрикоса, ореха или ели — без единого гвоздя или клея.
            </p>
            <p>
              Звучание комуза сопровождало эпические сказания манасчи, свадебные торжества, поминальные
              обряды и повседневную жизнь кочевников. Каждый мастер-музыкант (комузчу) создавал
              собственный уникальный стиль игры, передавая его ученикам.
            </p>
            <p>
              В 2019 году ЮНЕСКО включило искусство игры на комузе в Список нематериального
              культурного наследия человечества.
            </p>
          </section>

          <section className="about__section">
            <h2>Технология</h2>
            <p>
              Проект использует модель <strong>MusicGen</strong> от Meta AI, дообученную на
              аутентичных записях кыргызского комуза. Архитектура платформы:
            </p>
            <ul className="about__list">
              <li><strong>Frontend:</strong> React + Vite → Vercel</li>
              <li><strong>Backend:</strong> FastAPI + PostgreSQL → Render.com</li>
              <li><strong>AI:</strong> Hugging Face Spaces (MusicGen checkpoint)</li>
              <li><strong>Аудио:</strong> Cloudinary (хранение WAV файлов)</li>
            </ul>
            <p>
              AI-модуль подключается через REST API к Hugging Face Spaces, что позволяет заменить
              модель без изменения основного кода. Это трёхуровневая архитектура: клиент, сервер, данные
              — с изолированным AI-компонентом.
            </p>
          </section>

          <section className="about__section">
            <h2>Фазы разработки</h2>
            <div className="about__phases">
              <div className="about__phase about__phase--active">
                <div className="about__phase-num">Фаза 1</div>
                <div>
                  <strong>Платформа без реальной AI</strong>
                  <p>Mock-генерация (синусоидальный WAV). Работают auth, генерации, плейлисты, галерея.</p>
                </div>
              </div>
              <div className="about__phase">
                <div className="about__phase-num">Фаза 2</div>
                <div>
                  <strong>Реальная AI-генерация</strong>
                  <p>Загрузка checkpoint на HF Spaces. Переключение USE_MOCK_AI=false.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about__section">
            <h2>Культурная миссия</h2>
            <p>
              Платформа оцифровывает и популяризирует нематериальное культурное наследие Кыргызстана
              через современные AI-технологии. Цель — не заменить живых музыкантов, а создать
              инструмент для знакомства с традиционной музыкой и вдохновения новых исполнителей.
            </p>
            <p>
              Проект создан в рамках дипломной работы по направлению &laquo;Информационные системы&raquo;.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
