import { useState } from 'react'
import api from '../api/axios'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })
      onLogin(response.data.user, response.data.token)
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <svg viewBox="0 0 200 60" width="200" height="60">
            <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold">
              <tspan fill="#c71f37">iN</tspan>
              <tspan fill="#212121">10N</tspan>
              <tspan fill="#c71f37">T</tspan>
            </text>
          </svg>
        </div>
        <h2>Employee Management System</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login
