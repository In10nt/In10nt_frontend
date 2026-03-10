import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import theme from './theme'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import CEODashboard from './pages/CEODashboard'

function App() {
  const [user, setUser] = useState(null)

  // Function to refresh user data from localStorage
  const refreshUserData = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        refreshUserData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab updates
    const handleUserUpdate = () => {
      refreshUserData()
    }
    
    window.addEventListener('userUpdated', handleUserUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userUpdated', handleUserUpdate)
    }
  }, [])

  const handleLogin = (userData, token) => {
    // Store only essential user data to avoid localStorage quota issues
    const essentialUserData = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      address: userData.address,
      salary: userData.salary,
      active: userData.active
      // Exclude profilePicture and other large fields
    }
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(essentialUserData))
    setUser(essentialUserData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
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
