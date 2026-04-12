import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthModal.css'

export default function AuthModal() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const { login, register, loading, error, isAuthenticated } = useAuth()

  // Открываем при переходе на / со state openAuth=true
  useEffect(() => {
    if (location.state?.openAuth) {
      setIsOpen(true)
    }
  }, [location.state])

  // Закрываем после авторизации
  useEffect(() => {
    if (isAuthenticated) setIsOpen(false)
  }, [isAuthenticated])

  function close() {
    setIsOpen(false)
    setForm({ email: '', username: '', password: '' })
  }

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.email, form.username, form.password)
      }
    } catch {
      // error handled by hook
    }
  }

  if (!isOpen) {
    return (
      <button className="auth-fab btn btn-primary" onClick={() => setIsOpen(true)}>
        {isAuthenticated ? null : '↗ Войти'}
      </button>
    )
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Закрыть">✕</button>

        <h2 className="modal-title">
          {tab === 'login' ? 'Добро пожаловать' : 'Регистрация'}
        </h2>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Войти
          </button>
          <button
            className={`modal-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Регистрация
          </button>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="your@email.com"
              required
            />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Имя пользователя</label>
              <input
                className="form-input"
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="musician_kg"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}
