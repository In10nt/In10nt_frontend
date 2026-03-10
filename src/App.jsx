import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import CEODashboard from './pages/CEODashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          // Fetch latest user data from API to get updated profile picture
          const response = await axios.get(`/api/users/${parsedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUser(response.data)
          // Update localStorage with latest data
          localStorage.setItem('user', JSON.stringify(response.data))
        } catch (error) {
          console.error('Error loading user:', error)
          // Fallback to stored user data
          setUser(JSON.parse(userData))
        }
      }
      setLoading(false)
    }
    
    loadUser()
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={
            user ? (
              user.role === 'ADMIN' ? <AdminDashboard user={user} onLogout={handleLogout} /> :
              user.role === 'CEO' ? <CEODashboard user={user} onLogout={handleLogout} /> :
              <EmployeeDashboard user={user} onLogout={handleLogout} />
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
