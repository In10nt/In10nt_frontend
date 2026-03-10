import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider
} from '@mui/material'
import { Send, Notifications } from '@mui/icons-material'
import api from '../../api/axios'

function NotificationTest({ currentUser }) {
  const [testData, setTestData] = useState({
    userId: '',
    title: 'Test Notification',
    message: 'This is a test notification from the admin panel.',
    type: 'GENERAL'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const notificationTypes = [
    'GENERAL',
    'TASK_ASSIGNED',
    'TASK_COMMENT',
    'TASK_REMINDER',
    'ATTACHMENT_COMMENT',
    'ATTACHMENT_APPROVED',
    'ATTACHMENT_REJECTED',
    'ATTACHMENT_REVERTED'
  ]

  const handleInputChange = (field, value) => {
    setTestData(prev => ({ ...prev, [field]: value }))
  }

  const createTestNotification = async () => {
    if (!testData.userId || !testData.title || !testData.message) {
      setResult('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create notification directly via API
      const notificationData = {
        user: { id: parseInt(testData.userId) },
        fromUser: { id: currentUser.id },
        title: testData.title,
        message: testData.message,
        type: testData.type,
        isRead: false,
        createdAt: new Date().toISOString()
      }

      // Since we don't have a direct create endpoint, we'll simulate by creating a task comment
      // which will trigger a notification
      const response = await api.post('/notifications/test', notificationData)
      setResult('Test notification created successfully!')
    } catch (error) {
      console.error('Error creating test notification:', error)
      setResult('Error creating notification: ' + (error.response?.data || error.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchUserNotifications = async () => {
    if (!testData.userId) {
      setResult('Please select a user ID first')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/notifications/user/${testData.userId}`)
      setResult(`Found ${response.data.length} notifications for user ${testData.userId}`)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setResult('Error fetching notifications: ' + (error.response?.data || error.message))
    } finally {
      setLoading(false)
    }
  }

  const getUnreadCount = async () => {
    if (!testData.userId) {
      setResult('Please select a user ID first')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/notifications/user/${testData.userId}/count`)
      setResult(`User ${testData.userId} has ${response.data} unread notifications`)
    } catch (error) {
      console.error('Error getting unread count:', error)
      setResult('Error getting unread count: ' + (error.response?.data || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Notifications color="primary" />
          <Typography variant="h6">Notification System Test</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="User ID"
            type="number"
            value={testData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            size="small"
            helperText="Enter the ID of the user to send notification to"
          />

          <TextField
            label="Title"
            value={testData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            size="small"
          />

          <TextField
            label="Message"
            value={testData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            multiline
            rows={2}
            size="small"
          />

          <FormControl size="small">
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={testData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              label="Notification Type"
            >
              {notificationTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={createTestNotification}
              disabled={loading}
              size="small"
            >
              Create Test Notification
            </Button>

            <Button
              variant="outlined"
              onClick={fetchUserNotifications}
              disabled={loading}
              size="small"
            >
              Fetch User Notifications
            </Button>

            <Button
              variant="outlined"
              onClick={getUnreadCount}
              disabled={loading}
              size="small"
            >
              Get Unread Count
            </Button>
          </Box>

          {result && (
            <Alert severity={result.includes('Error') ? 'error' : 'success'}>
              {result}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default NotificationTest