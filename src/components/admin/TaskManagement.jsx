import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
  InputAdornment,
  LinearProgress,
  Tabs,
  Tab,
  Badge
} from '@mui/material'
import { Add, Edit, Delete, Assignment, Search, Check, Visibility } from '@mui/icons-material'
import api from '../../api/axios'
import TaskDetailsAdmin from './TaskDetailsAdmin'

function TaskManagement() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [open, setOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [taskFilter, setTaskFilter] = useState('all') // 'all', 'admin-created', 'employee-created'
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: null,
    dueDate: ''
  })

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, taskFilter])

  const fetchCurrentUser = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }

  const filterTasks = () => {
    let filtered = tasks
    
    // First filter by task type
    switch (taskFilter) {
      case 'admin-created':
        filtered = tasks.filter(task => {
          // Simple check: if createdBy exists and role is ADMIN or CEO
          return task.createdBy && 
                 (task.createdBy.role === 'ADMIN' || task.createdBy.role === 'CEO')
        })
        break
      case 'employee-created':
        filtered = tasks.filter(task => {
          // Simple check: if createdBy exists and role is EMPLOYEE
          return task.createdBy && task.createdBy.role === 'EMPLOYEE'
        })
        break
      default:
        filtered = tasks
    }
    
    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.priority.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredTasks(filtered)
  }

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks from API...')
      const response = await api.get('/tasks')
      console.log('Raw API response:', response.data)
      console.log('Tasks with createdBy details:', response.data.map(task => ({
        id: task.id,
        title: task.title,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo
      })))
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users')
      setEmployees(response.data.filter(u => u.role === 'EMPLOYEE'))
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare the task data with only the necessary fields
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo ? { id: formData.assignedTo.id } : null, // Only send user ID
        dueDate: formData.dueDate || null,
        status: editingTask ? editingTask.status : 'PENDING'
      }

      console.log('Sending task data:', taskData)

      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask.id}`, taskData)
        console.log('Task updated successfully:', response.data)
      } else {
        const response = await api.post('/tasks', taskData)
        console.log('Task created successfully:', response.data)
      }
      handleClose()
      fetchTasks()
    } catch (error) {
      console.error('Error saving task:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error saving task: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`)
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const handleApprove = async (id) => {
    try {
      // Send only the status update
      const updateData = { status: 'APPROVED' }
      console.log('Approving task with data:', updateData)
      
      await api.put(`/tasks/${id}`, updateData)
      fetchTasks()
    } catch (error) {
      console.error('Error approving task:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error approving task: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    })
    setOpen(true)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setTaskDetailsOpen(true)
  }

  const handleTaskUpdate = () => {
    fetchTasks() // This will refresh the task list with updated progress
  }

  const handleClose = () => {
    setOpen(false)
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedTo: null,
      dueDate: ''
    })
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'IN_PROGRESS': return 'info'
      case 'COMPLETED': return 'success'
      case 'APPROVED': return 'primary'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#000000' }}>
          Task Management ({filteredTasks.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              fetchTasks()
            }}
            sx={{ 
              borderColor: '#c71f37', 
              color: '#c71f37',
              '&:hover': { 
                borderColor: '#a01729',
                backgroundColor: 'rgba(199, 31, 55, 0.04)'
              }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Add Task
          </Button>
        </Box>
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
              <Badge 
                badgeContent={tasks.filter(t => t.createdBy?.role === 'ADMIN' || t.createdBy?.role === 'CEO').length} 
                color="primary" 
                sx={{ '& .MuiBadge-badge': { backgroundColor: '#1976d2' } }}
              >
                Created by Admin
              </Badge>
            } 
            value="admin-created" 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={tasks.filter(t => t.createdBy?.role === 'EMPLOYEE').length} 
                color="primary" 
                sx={{ '& .MuiBadge-badge': { backgroundColor: '#2e7d32' } }}
              >
                Created by Employees
              </Badge>
            } 
            value="employee-created" 
          />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search tasks by title, assignee, status, or priority..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#c71f37' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#c71f37',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#c71f37',
              },
            },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Assigned To</strong></TableCell>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment sx={{ color: '#c71f37' }} />
                    <Box>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="text.secondary">
                          {task.description.substring(0, 50)}...
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {task.createdBy?.role === 'EMPLOYEE' ? (
                          <Chip 
                            label={`Created by ${task.createdBy?.fullName}`} 
                            size="small" 
                            sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
                          />
                        ) : (
                          <Chip 
                            label={`Created by ${task.createdBy?.fullName || 'Admin'}`} 
                            size="small" 
                            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{task.assignedTo?.fullName || 'Unassigned'}</TableCell>
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
                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton onClick={() => handleViewTask(task)} sx={{ color: '#c71f37' }} title="View Details">
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(task)} sx={{ color: '#c71f37' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(task.id)} sx={{ color: '#c71f37' }}>
                      <Delete />
                    </IconButton>
                    {task.status === 'COMPLETED' && (
                      <IconButton onClick={() => handleApprove(task.id)} sx={{ color: '#c71f37' }} title="Approve Task">
                        <Check />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
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
              
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.fullName} (${option.role})`}
                value={formData.assignedTo}
                onChange={(event, newValue) => setFormData({ ...formData, assignedTo: newValue })}
                renderInput={(params) => <TextField {...params} label="Assign To" />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
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

      <TaskDetailsAdmin
        task={selectedTask}
        open={taskDetailsOpen}
        onClose={() => setTaskDetailsOpen(false)}
        onTaskUpdate={handleTaskUpdate}
        currentUser={currentUser}
        employees={employees}
      />
    </Box>
  )
}

export default TaskManagement
