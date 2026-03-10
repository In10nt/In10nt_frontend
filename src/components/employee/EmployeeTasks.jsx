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
  CardContent
} from '@mui/material'
import { Add, Visibility, PlayArrow } from '@mui/icons-material'
import api from '../../api/axios'
import TaskDetails from './TaskDetails'

function EmployeeTasks({ userId, currentUser }) {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/assigned/${userId}`)
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#000000' }}>
          My Tasks ({tasks.length})
        </Typography>
      </Box>

      {tasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No tasks assigned yet
            </Typography>
            <Typography color="text.secondary">
              Tasks assigned to you will appear here
            </Typography>
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
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="text.secondary">
                          {task.description.substring(0, 50)}...
                        </Typography>
                      )}
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
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
