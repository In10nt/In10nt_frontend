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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material'
import {
  Add,
  Delete,
  PlayArrow,
  Comment,
  Close,
  CheckCircle,
  RadioButtonUnchecked,
  AttachFile,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility,
  CloudUpload
} from '@mui/icons-material'
import api from '../../api/axios'
import AttachmentWithComments from '../common/AttachmentWithComments'

function TaskDetails({ task, open, onClose, onTaskUpdate, currentUser }) {
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [reminders, setReminders] = useState([])
  const [attachments, setAttachments] = useState([])
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' })
  const [newComment, setNewComment] = useState('')
  const [newAttachment, setNewAttachment] = useState({ 
    type: 'LINK', 
    fileName: '', 
    fileUrl: '', 
    description: '' 
  })
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [showAttachmentForm, setShowAttachmentForm] = useState(false)
  const [taskProgress, setTaskProgress] = useState(0)

  useEffect(() => {
    if (task && open) {
      fetchSubtasks()
      fetchComments()
      fetchReminders()
      fetchAttachments()
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

  const fetchAttachments = async () => {
    try {
      // First test if the endpoint is reachable
      const testResponse = await api.get('/task-attachments/test')
      console.log('TaskAttachment endpoint test:', testResponse.data)
      
      const response = await api.get(`/task-attachments/task/${task.id}`)
      setAttachments(response.data)
    } catch (error) {
      console.error('Error fetching attachments:', error)
      if (error.response?.status === 404) {
        console.error('TaskAttachment endpoint not found - controller may not be loaded')
      }
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
      setTimeout(async () => {
        onTaskUpdate()
        // Refresh the task details to show updated progress
        if (task && task.id) {
          try {
            const updatedTaskResponse = await api.get(`/tasks/${task.id}`)
            if (updatedTaskResponse.data) {
              setTaskProgress(updatedTaskResponse.data.progress || 0)
              // Show completion message if task is now completed
              if (updatedTaskResponse.data.progress === 100 && updatedTaskResponse.data.status === 'COMPLETED') {
                alert('🎉 Congratulations! Task completed automatically as all subtasks are done!')
              }
            }
          } catch (error) {
            console.error('Error fetching updated task:', error)
          }
        }
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

  const handleAddAttachment = async () => {
    if (!newAttachment.fileName.trim() || !newAttachment.fileUrl.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      const attachmentData = {
        taskId: task.id,
        uploadedById: currentUser.id,
        fileName: newAttachment.fileName,
        type: newAttachment.type,
        fileUrl: newAttachment.fileUrl,
        description: newAttachment.description
      }
      
      console.log('Sending attachment data:', attachmentData)
      console.log('Current user:', currentUser)
      console.log('Current task:', task)
      
      const response = await api.post('/task-attachments', attachmentData)
      console.log('Attachment created successfully:', response.data)
      
      setNewAttachment({ type: 'LINK', fileName: '', fileUrl: '', description: '' })
      setShowAttachmentForm(false)
      fetchAttachments()
      alert('Attachment added successfully!')
    } catch (error) {
      console.error('Error adding attachment:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMessage = 'Please try again.'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`Error adding attachment: ${errorMessage}`)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // For images, convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewAttachment({
          ...newAttachment,
          fileName: file.name,
          fileUrl: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      try {
        await api.delete(`/task-attachments/${attachmentId}`)
        fetchAttachments()
      } catch (error) {
        console.error('Error deleting attachment:', error)
        alert('Error deleting attachment. Please try again.')
      }
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

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'APPROVED': return 'success'
      case 'REJECTED': return 'error'
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

          {/* Work Attachments */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Work Attachments ({attachments.length})</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Employees can attach work at any task status
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFile />}
                    onClick={() => setShowAttachmentForm(true)}
                    sx={{ borderColor: '#c71f37', color: '#c71f37' }}
                  >
                    Add Work
                  </Button>
                </Box>
              </Box>
              
              {showAttachmentForm && (
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={newAttachment.type}
                          onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                          label="Type"
                        >
                          <MenuItem value="LINK">Link</MenuItem>
                          <MenuItem value="IMAGE">Image</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="File Name"
                        value={newAttachment.fileName}
                        onChange={(e) => setNewAttachment({ ...newAttachment, fileName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {newAttachment.type === 'LINK' ? (
                        <TextField
                          fullWidth
                          label="URL"
                          value={newAttachment.fileUrl}
                          onChange={(e) => setNewAttachment({ ...newAttachment, fileUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      ) : (
                        <Box>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileUpload}
                          />
                          <label htmlFor="file-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<CloudUpload />}
                              sx={{ borderColor: '#c71f37', color: '#c71f37' }}
                            >
                              Upload Image
                            </Button>
                          </label>
                          {newAttachment.fileUrl && (
                            <Typography variant="caption" sx={{ ml: 2 }}>
                              Image selected: {newAttachment.fileName}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={newAttachment.description}
                        onChange={(e) => setNewAttachment({ ...newAttachment, description: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddAttachment}
                      sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
                    >
                      Add Attachment
                    </Button>
                    <Button onClick={() => setShowAttachmentForm(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
              
              {/* Enhanced Attachments with Comments */}
              <Box>
                {attachments.map((attachment) => (
                  <AttachmentWithComments
                    key={attachment.id}
                    attachment={attachment}
                    currentUser={currentUser}
                    onAttachmentUpdate={fetchAttachments}
                    isAdmin={false}
                  />
                ))}
                {attachments.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No work attachments yet. Add links or images of your work!
                  </Typography>
                )}
              </Box>
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