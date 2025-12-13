import { useState } from 'react'
import PropTypes from 'prop-types'

export default function AuthPanel({ onLogin, onRegister, loading }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'login') onLogin(form)
    else onRegister(form)
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
          Kirish
        </button>
        <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>
          Ro'yxatdan o'tish
        </button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          Parol
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Yuklanmoqda...' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
        </button>
      </form>
    </div>
  )
}

AuthPanel.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}
