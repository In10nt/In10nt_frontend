import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge
} from '@mui/material'
import { Add, Visibility, PlayArrow, Edit, Delete } from '@mui/icons-material'
import api from '../../api/axios'
import TaskDetails from './TaskDetails'

function EmployeeTasks({ userId, currentUser }) {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [taskFilter, setTaskFilter] = useState('all') // 'all', 'created', 'assigned'
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [userId])

  useEffect(() => {
    filterTasks()
  }, [tasks, taskFilter])

  const filterTasks = () => {
    let filtered = tasks
    
    switch (taskFilter) {
      case 'created':
        filtered = tasks.filter(task => task.createdBy?.id === userId)
        break
      case 'assigned':
        filtered = tasks.filter(task => task.createdBy?.id !== userId)
        break
      default:
        filtered = tasks
    }
    
    setFilteredTasks(filtered)
  }

  const fetchTasks = async () => {
    try {
      // Get both assigned tasks and tasks created by the employee
      const [assignedResponse, createdResponse] = await Promise.all([
        api.get(`/tasks/assigned/${userId}`),
        api.get(`/tasks`)
      ])
      
      // Filter created tasks by current user and combine with assigned tasks
      const createdTasks = createdResponse.data.filter(task => task.createdBy?.id === userId)
      const assignedTasks = assignedResponse.data
      
      // Combine and remove duplicates
      const allTasks = [...assignedTasks]
      createdTasks.forEach(task => {
        if (!allTasks.find(t => t.id === task.id)) {
          allTasks.push(task)
        }
      })
      
      setTasks(allTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        status: 'PENDING',
        assignedTo: { id: userId }, // Assign to self
        createdBy: { id: userId }
      }

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData)
      } else {
        await api.post('/tasks', taskData)
      }
      
      handleCloseDialog()
      fetchTasks()
    } catch (error) {
      console.error('Error saving task:', error)
      if (error.response?.status === 403) {
        alert('You can only edit tasks you created yourself.')
      } else {
        alert('Error saving task. Please try again.')
      }
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    })
    setCreateTaskOpen(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`)
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
        if (error.response?.status === 403) {
          alert('You can only delete tasks you created yourself.')
        } else {
          alert('Error deleting task. Please try again.')
        }
      }
    }
  }

  const handleCloseDialog = () => {
    setCreateTaskOpen(false)
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: ''
    })
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setTaskDetailsOpen(true)
  }

  const handleStartTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/start`)
      fetchTasks()
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const handleTaskUpdate = () => {
    fetchTasks()
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

  const canEditTask = (task) => {
    // Employees can only edit/delete tasks they created themselves
    // Admin-assigned tasks cannot be edited/deleted by employees
    return task.createdBy?.id === userId
  }

  const canDeleteTask = (task) => {
    // Same rule as edit - only tasks created by the employee
    return task.createdBy?.id === userId
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#000000' }}>
          My Tasks ({filteredTasks.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateTaskOpen(true)}
          sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
        >
          Create Task
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={taskFilter} 
          onChange={(e, newValue) => setTaskFilter(newValue)}
          sx={{ 
            '& .MuiTab-root': { 
              color: '#666',
              '&.Mui-selected': { 
                color: '#c71f37' 
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#c71f37'
            }
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={tasks.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#c71f37' } }}>
                All Tasks
              </Badge>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.createdBy?.id === userId).length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#2e7d32' } }}>
                Created by Me
              </Badge>
            } 
            value="created" 
          />
          <Tab 
            label={
              <Badge badgeContent={tasks.filter(t => t.createdBy?.id !== userId).length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#f57c00' } }}>
                Assigned by Admin
              </Badge>
            } 
            value="assigned" 
          />
        </Tabs>
      </Box>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {taskFilter === 'created' ? 'No tasks created by you yet' : 
               taskFilter === 'assigned' ? 'No tasks assigned by admin yet' : 
               'No tasks yet'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {taskFilter === 'created' ? 'Create your first task to get started!' : 
               taskFilter === 'assigned' ? 'Admin will assign tasks to you.' : 
               'Create your first task to get started!'}
            </Typography>
            {(taskFilter === 'all' || taskFilter === 'created') && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateTaskOpen(true)}
                sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
              >
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Task</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="text.secondary">
                          {task.description.substring(0, 50)}...
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {task.createdBy?.id === userId ? (
                          <Chip 
                            label="Created by me" 
                            size="small" 
                            sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
                          />
                        ) : (
                          <Chip 
                            label="Assigned by Admin" 
                            size="small" 
                            sx={{ backgroundColor: '#fff3e0', color: '#f57c00' }} 
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={task.progress || 0}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#c71f37'
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 35 }}>
                        {task.progress || 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleViewTask(task)}
                        sx={{ color: '#c71f37' }}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      {task.status === 'PENDING' && (
                        <IconButton
                          onClick={() => handleStartTask(task.id)}
                          sx={{ color: '#c71f37' }}
                          title="Start Task"
                        >
                          <PlayArrow />
                        </IconButton>
                      )}
                      {canEditTask(task) && (
                        <IconButton
                          onClick={() => handleEditTask(task)}
                          sx={{ color: '#c71f37' }}
                          title="Edit Task"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {canDeleteTask(task) && (
                        <IconButton
                          onClick={() => handleDeleteTask(task.id)}
                          sx={{ color: '#c71f37' }}
                          title="Delete Task"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={createTaskOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <form onSubmit={handleCreateTask}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
            >
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <TaskDetails
        task={selectedTask}
        open={taskDetailsOpen}
        onClose={() => setTaskDetailsOpen(false)}
        onTaskUpdate={handleTaskUpdate}
        currentUser={currentUser}
      />
    </Box>
  )
}

export default EmployeeTasks
