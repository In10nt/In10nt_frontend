import { useState } from 'react'
import api from '../api/axios'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 6, border: '2px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <svg viewBox="0 0 200 60" width="200" height="60">
                <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold">
                  <tspan fill="#D32F2F">iN</tspan>
                  <tspan fill="#666666">10N</tspan>
                  <tspan fill="#D32F2F">T</tspan>
                </text>
              </svg>
              <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: 600, color: '#D32F2F' }}>
                Employee Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                autoComplete="email"
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                autoComplete="current-password"
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{ mt: 3, py: 1.5 }}
              >
                Login
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block">
                Admin: admin@in10nt.com / admin123
              </Typography>
              <Typography variant="caption" display="block">
                CEO: ceo@in10nt.com / ceo123
              </Typography>
              <Typography variant="caption" display="block">
                Employee: employee@in10nt.com / emp123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login
