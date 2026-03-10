import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  LinearProgress,
  Chip,
  Divider,
  Avatar,
  Paper
} from '@mui/material'
import {
  Add,
  Delete,
  PlayArrow,
  Comment,
  Close,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material'
import api from '../../api/axios'

function TaskDetails({ task, open, onClose, onTaskUpdate, currentUser }) {
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [reminders, setReminders] = useState([])
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' })
  const [newComment, setNewComment] = useState('')
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [taskProgress, setTaskProgress] = useState(0)

  useEffect(() => {
    if (task && open) {
      fetchSubtasks()
      fetchComments()
      fetchReminders()
      setTaskProgress(task.progress || 0)
    }
  }, [task, open])

  const fetchSubtasks = async () => {
    try {
      const response = await api.get(`/subtasks/task/${task.id}`)
      setSubtasks(response.data)
    } catch (error) {
      console.error('Error fetching subtasks:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/task-comments/task/${task.id}`)
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await api.get(`/task-reminders/task/${task.id}`)
      setReminders(response.data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const handleStartTask = async () => {
    try {
      await api.put(`/tasks/${task.id}/start`)
      onTaskUpdate()
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const handleAddSubtask = async () => {
    try {
      const subtaskData = {
        title: newSubtask.title,
        description: newSubtask.description,
        parentTaskId: task.id
      }
      await api.post('/subtasks', subtaskData)
      setNewSubtask({ title: '', description: '' })
      setShowSubtaskForm(false)
      fetchSubtasks()
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  const handleToggleSubtask = async (subtaskId, isCompleted) => {
    try {
      await api.put(`/subtasks/${subtaskId}`, { isCompleted: !isCompleted })
      fetchSubtasks()
      // Refresh task to get updated progress
      setTimeout(() => {
        onTaskUpdate()
      }, 500)
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      try {
        await api.delete(`/subtasks/${subtaskId}`)
        fetchSubtasks()
        onTaskUpdate()
      } catch (error) {
        console.error('Error deleting subtask:', error)
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      const commentData = {
        taskId: task.id,
        commentText: newComment,
        createdById: currentUser.id
      }
      await api.post('/task-comments', commentData)
      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'IN_PROGRESS': return 'info'
      case 'COMPLETED': return 'success'
      case 'APPROVED': return 'primary'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'success'
      case 'MEDIUM': return 'info'
      case 'HIGH': return 'warning'
      case 'URGENT': return 'error'
      default: return 'default'
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{task.title}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Task Info */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip label={task.status} color={getStatusColor(task.status)} />
                  <Chip label={task.priority} color={getPriorityColor(task.priority)} />
                </Box>
                {task.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleStartTask}
                    sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
                  >
                    Start Task
                  </Button>
                )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {task.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Progress: {taskProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={taskProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#c71f37'
                    }
                  }} 
                />
              </Box>
              
              {task.dueDate && (
                <Typography variant="body2" color="text.secondary">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Subtasks ({subtasks.length})</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setShowSubtaskForm(true)}
                  sx={{ borderColor: '#c71f37', color: '#c71f37' }}
                >
                  Add Subtask
                </Button>
              </Box>
              
              {showSubtaskForm && (
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                  <TextField
                    fullWidth
                    label="Subtask Title"
                    value={newSubtask.title}
                    onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={2}
                    value={newSubtask.description}
                    onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.title.trim()}
                      sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
                    >
                      Add
                    </Button>
                    <Button onClick={() => setShowSubtaskForm(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
              
              <List>
                {subtasks.map((subtask) => (
                  <ListItem key={subtask.id} divider>
                    <Checkbox
                      checked={subtask.isCompleted}
                      onChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle sx={{ color: '#c71f37' }} />}
                    />
                    <ListItemText
                      primary={subtask.title}
                      secondary={subtask.description}
                      sx={{
                        textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                        opacity: subtask.isCompleted ? 0.7 : 1
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleDeleteSubtask(subtask.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {subtasks.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No subtasks yet. Add some to track your progress!
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<Comment />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{ 
                    mt: 1, 
                    backgroundColor: '#c71f37', 
                    '&:hover': { backgroundColor: '#a01729' } 
                  }}
                >
                  Add Comment
                </Button>
              </Box>
              
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: '#c71f37', mr: 2 }}>
                      {comment.createdBy?.fullName?.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.createdBy?.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.commentText}
                    />
                  </ListItem>
                ))}
                {comments.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No comments yet.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Reminders */}
          {reminders.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Reminders</Typography>
                <List>
                  {reminders.map((reminder) => (
                    <ListItem key={reminder.id} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: '#c71f37', mr: 2 }}>
                        {reminder.sentBy?.fullName?.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">
                              From: {reminder.sentBy?.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reminder.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={reminder.reminderText}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetails