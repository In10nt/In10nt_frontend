import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import api from '../../api/axios'

function EmployeeDashboardView({ userId }) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    recentTasks: [],
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [userId])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/tasks')
      const userTasks = response.data.filter(t => t.assignedTo?.id === userId)

      const completed = userTasks.filter(t => t.status === 'COMPLETED').length
      const inProgress = userTasks.filter(t => t.status === 'IN_PROGRESS').length
      const pending = userTasks.filter(t => t.status === 'PENDING').length

      // Get 5 most recent tasks
      const recent = userTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)

      setStats({
        totalTasks: userTasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        recentTasks: recent,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ color, fontWeight: 600 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'IN_PROGRESS':
        return 'warning'
      case 'PENDING':
        return 'error'
      default:
        return 'default'
    }
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        My Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<AssignmentIcon sx={{ fontSize: 40, color: '#D32F2F' }} />}
            color="#D32F2F"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#388E3C' }} />}
            color="#388E3C"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: '#F57C00' }} />}
            color="#F57C00"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pendingTasks}
            icon={<ScheduleIcon sx={{ fontSize: 40, color: '#1976D2' }} />}
            color="#1976D2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {completionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#D32F2F',
                    },
                  }}
                />
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Task Breakdown:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${stats.completedTasks} Completed`}
                      size="small"
                      sx={{ backgroundColor: '#388E3C15', color: '#388E3C' }}
                    />
                    <Chip
                      label={`${stats.inProgressTasks} In Progress`}
                      size="small"
                      sx={{ backgroundColor: '#F57C0015', color: '#F57C00' }}
                    />
                    <Chip
                      label={`${stats.pendingTasks} Pending`}
                      size="small"
                      sx={{ backgroundColor: '#1976D215', color: '#1976D2' }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.recentTasks.length > 0 ? (
                  stats.recentTasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid #e0e0e0',
                        '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={task.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(task.status)}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tasks assigned yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EmployeeDashboardView
