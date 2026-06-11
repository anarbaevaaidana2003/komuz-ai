import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          Komuz<span>-AI</span>
        </NavLink>

        <ul className="navbar-nav">
          <li><NavLink to="/gallery">Галерея</NavLink></li>
          <li><NavLink to="/about">Долбоор жөнүндө</NavLink></li>
          {isAuthenticated && (
            <>
              <li><NavLink to="/generate">Түзүү</NavLink></li>
              <li><NavLink to="/dashboard">Менин тректерим</NavLink></li>
              <li><NavLink to="/playlists">Плейлисттер</NavLink></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          <button
            className="btn btn-ghost-light btn-sm navbar-theme-btn"
            onClick={toggle}
            aria-label="Тема которые"
            title={theme === 'light' ? 'Күңүрт темага өтүү' : 'Жарык темага өтүү'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="navbar-username">
                {user?.username}
              </span>
              <button className="btn btn-ghost-light btn-sm" onClick={logout}>
                Чыгуу
              </button>
            </div>
          ) : (
            <NavLink to="/" className="btn btn-primary btn-sm" state={{ openAuth: true }}>
              Кирүү
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
