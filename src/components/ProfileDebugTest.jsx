import { useState } from 'react'
import { Button, Box, Typography, Alert } from '@mui/material'
import api from '../api/axios'

function ProfileDebugTest({ user }) {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testApiConnection = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      // Test 1: Check if API is reachable
      console.log('Testing API connection...')
      const response = await api.get('/users')
      console.log('Users API response:', response.data)
      
      // Test 2: Check if current user exists
      if (user?.id) {
        console.log('Testing user fetch for ID:', user.id)
        const userResponse = await api.get(`/users/${user.id}`)
        console.log('Current user data:', userResponse.data)
        
        // Test 3: Try a simple update (without profile picture)
        const testData = {
          fullName: userResponse.data.fullName,
          email: userResponse.data.email,
          phone: userResponse.data.phone || '',
          address: userResponse.data.address || '',
          department: userResponse.data.department || ''
        }
        
        console.log('Testing user update with data:', testData)
        const updateResponse = await api.put(`/users/${user.id}`, testData)
        console.log('Update response:', updateResponse.data)
        
        setTestResult('✅ All API tests passed! Profile update should work.')
      } else {
        setTestResult('❌ No user ID found in localStorage')
      }
      
    } catch (error) {
      console.error('API Test Error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMsg = '❌ API Test Failed: '
      if (error.response?.status === 404) {
        errorMsg += 'User not found (404)'
      } else if (error.response?.status === 401) {
        errorMsg += 'Unauthorized (401) - Check authentication'
      } else if (error.response?.status === 500) {
        errorMsg += 'Server error (500) - Check backend logs'
      } else if (error.code === 'NETWORK_ERROR') {
        errorMsg += 'Network error - Is backend running on port 8081?'
      } else {
        errorMsg += error.message || 'Unknown error'
      }
      
      setTestResult(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Profile API Debug Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testApiConnection}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </Button>
      
      {testResult && (
        <Alert 
          severity={testResult.includes('✅') ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {testResult}
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Current user ID: {user?.id || 'Not found'}<br/>
        Check browser console for detailed logs.
      </Typography>
    </Box>
  )
}

export default ProfileDebugTest