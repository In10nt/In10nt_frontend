import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  EventNote as EventNoteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import api from '../../api/axios'

function AdminDashboardView() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalEmployees: 0,
    pendingLeaves: 0,
    totalInventory: 0,
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [tasks, users, leaves, inventory] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
        api.get('/leaves'),
        api.get('/inventory'),
      ])

      const completedTasks = tasks.data.filter(t => t.status === 'COMPLETED').length
      const pendingTasks = tasks.data.filter(t => t.status === 'PENDING').length
      const pendingLeaves = leaves.data.filter(l => l.status === 'PENDING').length

      setStats({
        totalTasks: tasks.data.length,
        completedTasks,
        pendingTasks,
        totalEmployees: users.data.length,
        pendingLeaves,
        totalInventory: inventory.data.length,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const StatCard = ({ title, value, icon, color }) => (
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<AssignmentIcon sx={{ fontSize: 40, color: '#D32F2F' }} />}
            color="#D32F2F"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#388E3C' }} />}
            color="#388E3C"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={<PendingIcon sx={{ fontSize: 40, color: '#F57C00' }} />}
            color="#F57C00"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<PeopleIcon sx={{ fontSize: 40, color: '#1976D2' }} />}
            color="#1976D2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<EventNoteIcon sx={{ fontSize: 40, color: '#7B1FA2' }} />}
            color="#7B1FA2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Inventory Items"
            value={stats.totalInventory}
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: '#0288D1' }} />}
            color="#0288D1"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Task Completion Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.totalTasks > 0
                      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                      : 0}
                    %
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Active Employees
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.totalEmployees}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Actions
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error">
                    {stats.pendingLeaves + stats.pendingTasks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • {stats.pendingTasks} tasks awaiting assignment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • {stats.pendingLeaves} leave requests pending approval
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • {stats.totalEmployees} active employees in system
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {stats.totalInventory} items in inventory
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboardView
