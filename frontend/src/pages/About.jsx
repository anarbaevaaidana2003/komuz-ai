import './About.css'

export default function About() {
  return (
    <main className="page about-page">
      <div className="container about__inner">
        <header className="about__header">
          <h1>Долбоор жөнүндө</h1>
          <p className="about__lead">
            Komuz-AI — жасалма интеллект менен Кыргызстандын маданий мурасынын чегиндеги платформа
          </p>
        </header>

        <div className="about__grid">
          <section className="about__section">
            <h2>Комуздун тарыхы</h2>
            <p>
              Комуз — Борбордук Азиядагы эң байыркы аспаптардын бири болгон үч кылдуу чертме аспап.
              Анын тарыхы үч миңден ашык жылды камтыйт. Салттуу түрдө өрүк, жаңгак же карагайдан
              бир бүтүн жыгачтан жасалган — бир да мык же желим колдонулбастан.
            </p>
            <p>
              Комуздун үнү манасчылардын эпикалык жомоктору, той маарекелери, аза күтүү салттары
              жана көчмөндөрдүн күнүмдүк жашоосун коштоп келген. Ар бир чебер-музыкант (комузчу)
              өзүнүн уникалдуу оюн стилин түзүп, аны шакирттерине берип келген.
            </p>
            <p>
              2017-жылы ЮНЕСКО комузда ойноо өнөрүн материалдык эмес маданий мурастардын
              репрезентативдүү тизмесине киргизген.
            </p>
          </section>

          <section className="about__section">
            <h2>Технология</h2>
            <p>
              Долбоор Meta AI компаниясынын <strong>MusicGen</strong> моделин колдонот, ал
              кыргыз комузунун аутентикалык жазуулары менен кошумча үйрөтүлгөн. Платформанын архитектурасы:
            </p>
            <ul className="about__list">
              <li><strong>Frontend:</strong> React + Vite → Vercel</li>
              <li><strong>Backend:</strong> FastAPI + PostgreSQL → Render.com</li>
              <li><strong>AI:</strong> Hugging Face Spaces (MusicGen + RVC checkpoint)</li>
              <li><strong>Аудио:</strong> Cloudinary (WAV файлдарын сактоо)</li>
            </ul>
            <p>
              AI-модул Hugging Face Spaces&apos;ке REST API аркылуу туташат, бул негизги кодду
              өзгөртпөстөн моделди алмаштырууга мүмкүндүк берет. Бул үч деңгээлдүү архитектура:
              клиент, сервер, маалыматтар — обочолонгон AI-компонент менен.
            </p>
          </section>

          <section className="about__section">
            <h2>Иштеп чыгуу фазалары</h2>
            <div className="about__phases">
              <div className="about__phase about__phase--active">
                <div className="about__phase-num">Фаза 1</div>
                <div>
                  <strong>Чыныгы AI жок платформа</strong>
                  <p>Mock-жаратуу (синусоидалдык WAV). Auth, жаратуулар, плейлисттер, галерея иштейт.</p>
                </div>
              </div>
              <div className="about__phase">
                <div className="about__phase-num">Фаза 2</div>
                <div>
                  <strong>Чыныгы AI-жаратуу</strong>
                  <p>HF Spaces&apos;ке checkpoint жүктөө. USE_MOCK_AI=false которуу.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about__section">
            <h2>Маданий миссия</h2>
            <p>
              Платформа заманбап AI-технологиялары аркылуу Кыргызстандын материалдык эмес маданий
              мурасын санариптештирет жана популярлаштырат. Максат — тирүү музыканттарды алмаштыруу эмес,
              салттуу музыка менен таанышуу жана жаңы аткаруучуларды шыктандыруу куралын түзүү.
            </p>
            <p>
              Долбоор «Программалык инженерия» багытындагы дипломдук иштин алкагында жасалган.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
