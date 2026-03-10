import { useState, useEffect } from 'react'
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Chip,
  Paper
} from '@mui/material'
import {
  Notifications,
  NotificationsNone,
  Circle,
  Task,
  Comment,
  Attachment,
  CheckCircle,
  Cancel,
  Undo,
  Assignment
} from '@mui/icons-material'
import api from '../../api/axios'

function NotificationBell({ user }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount()
      // Fetch unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/notifications/user/${user.id}/count`)
      setUnreadCount(response.data)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await api.get(`/notifications/user/${user.id}`)
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    if (notifications.length === 0) {
      fetchNotifications()
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/mark-read`)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${user.id}/mark-all-read`)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_COMPLETED':
        return <Assignment fontSize="small" />
      case 'TASK_COMMENT':
        return <Comment fontSize="small" />
      case 'TASK_REMINDER':
        return <Circle fontSize="small" />
      case 'ATTACHMENT_COMMENT':
        return <Comment fontSize="small" />
      case 'ATTACHMENT_APPROVED':
        return <CheckCircle fontSize="small" color="success" />
      case 'ATTACHMENT_REJECTED':
        return <Cancel fontSize="small" color="error" />
      case 'ATTACHMENT_REVERTED':
        return <Undo fontSize="small" />
      default:
        return <Circle fontSize="small" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ATTACHMENT_APPROVED':
        return 'success'
      case 'ATTACHMENT_REJECTED':
        return 'error'
      case 'TASK_ASSIGNED':
        return 'primary'
      case 'TASK_REMINDER':
        return 'warning'
      default:
        return 'default'
    }
  }

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        size="large"
        aria-label="notifications"
        onClick={handleClick}
        sx={{ color: '#c71f37' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 10).map((notification, index) => (
              <div key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : '#f5f5f5',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: getNotificationColor(notification.type) === 'default' ? '#c71f37' : 'transparent'
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Circle sx={{ fontSize: 8, color: '#c71f37' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {notification.fromUser?.fullName && `From: ${notification.fromUser.fullName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </div>
            ))}
            
            {notifications.length > 10 && (
              <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary">
                  Showing 10 of {notifications.length} notifications
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Menu>
    </>
  )
}

export default NotificationBell