import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          Komuz<span>-AI</span>
        </NavLink>

        <ul className="navbar-nav">
          <li><NavLink to="/gallery">Галерея</NavLink></li>
          <li><NavLink to="/about">О проекте</NavLink></li>
          {isAuthenticated && (
            <>
              <li><NavLink to="/generate">Создать</NavLink></li>
              <li><NavLink to="/dashboard">Мои треки</NavLink></li>
              <li><NavLink to="/playlists">Плейлисты</NavLink></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="navbar-username">
                {user?.username}
              </span>
              <button className="btn btn-ghost-light btn-sm" onClick={logout}>
                Выйти
              </button>
            </div>
          ) : (
            <NavLink to="/" className="btn btn-primary btn-sm" state={{ openAuth: true }}>
              Войти
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
