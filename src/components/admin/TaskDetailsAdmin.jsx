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
  MenuItem
} from '@mui/material'
import {
  Add,
  Delete,
  Comment,
  Close,
  CheckCircle,
  RadioButtonUnchecked,
  Send,
  Notifications,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility
} from '@mui/icons-material'
import api from '../../api/axios'

function TaskDetailsAdmin({ task, open, onClose, onTaskUpdate, currentUser, employees }) {
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [reminders, setReminders] = useState([])
  const [attachments, setAttachments] = useState([])
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' })
  const [newComment, setNewComment] = useState('')
  const [newReminder, setNewReminder] = useState({ text: '', recipientId: '' })
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
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
      const response = await api.get(`/task-attachments/task/${task.id}`)
      setAttachments(response.data)
    } catch (error) {
      console.error('Error fetching attachments:', error)
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

  const handleSendReminder = async () => {
    if (!newReminder.text.trim() || !newReminder.recipientId) return
    
    try {
      const reminderData = {
        taskId: task.id,
        reminderText: newReminder.text,
        sentById: currentUser.id,
        sentToId: newReminder.recipientId
      }
      await api.post('/task-reminders', reminderData)
      setNewReminder({ text: '', recipientId: '' })
      setShowReminderForm(false)
      fetchReminders()
    } catch (error) {
      console.error('Error sending reminder:', error)
    }
  }

  const handleReviewAttachment = async (attachmentId, approvalStatus, reviewComment = '') => {
    try {
      const reviewData = {
        approvalStatus,
        reviewedById: currentUser.id,
        reviewComment
      }
      await api.put(`/task-attachments/${attachmentId}/review`, reviewData)
      fetchAttachments()
    } catch (error) {
      console.error('Error reviewing attachment:', error)
      alert('Error reviewing attachment. Please try again.')
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Notifications />}
                    onClick={() => setShowReminderForm(true)}
                    sx={{ borderColor: '#c71f37', color: '#c71f37' }}
                  >
                    Send Reminder
                  </Button>
                </Box>
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
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Assigned to: {task.assignedTo?.fullName || 'Unassigned'}
                </Typography>
                {task.dueDate && (
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                )}
                {task.taskStartedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Started: {new Date(task.taskStartedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Work Attachments Review */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Work Attachments ({attachments.length})</Typography>
                <Typography variant="caption" color="text.secondary">
                  Employees can attach work at any task status
                </Typography>
              </Box>
              
              <List>
                {attachments.map((attachment) => (
                  <ListItem key={attachment.id} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {attachment.type === 'LINK' ? (
                        <LinkIcon />
                      ) : (
                        <ImageIcon />
                      )}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">{attachment.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded by: {attachment.uploadedBy?.fullName}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {attachment.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={attachment.approvalStatus} 
                            color={getApprovalStatusColor(attachment.approvalStatus)}
                            size="small"
                          />
                          {attachment.reviewComment && (
                            <Typography variant="caption" color="text.secondary">
                              Review: {attachment.reviewComment}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {attachment.type === 'LINK' ? (
                            <IconButton 
                              onClick={() => window.open(attachment.fileUrl, '_blank')}
                              title="Open Link"
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                          ) : (
                            <IconButton 
                              onClick={() => window.open(attachment.fileUrl, '_blank')}
                              title="View Image"
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                          )}
                        </Box>
                        {attachment.approvalStatus === 'PENDING' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleReviewAttachment(attachment.id, 'APPROVED', 'Work approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => {
                                const comment = prompt('Rejection reason (optional):')
                                handleReviewAttachment(attachment.id, 'REJECTED', comment || 'Work rejected')
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                {attachments.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No work attachments submitted yet.
                  </Typography>
                )}
              </List>
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
                    No subtasks yet. Add some to help track progress!
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
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Reminders Sent</Typography>
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
                            To: {reminder.sentTo?.fullName}
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
                {reminders.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No reminders sent yet.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderForm} onClose={() => setShowReminderForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Reminder</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Send To</InputLabel>
              <Select
                value={newReminder.recipientId}
                onChange={(e) => setNewReminder({ ...newReminder, recipientId: e.target.value })}
                label="Send To"
              >
                {task.assignedTo && (
                  <MenuItem value={task.assignedTo.id}>
                    {task.assignedTo.fullName} (Assigned User)
                  </MenuItem>
                )}
                {employees?.filter(emp => emp.id !== task.assignedTo?.id).map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.fullName} ({employee.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reminder Message"
              value={newReminder.text}
              onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReminderForm(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSendReminder}
            disabled={!newReminder.text.trim() || !newReminder.recipientId}
            sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}

export default TaskDetailsAdmin