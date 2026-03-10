import { useState, useEffect } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import {
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Grid,
} from '@mui/material'
import './CEODashboard.css'

function CEODashboard({ user, onLogout }) {
  const [period, setPeriod] = useState('monthly')
  const [stats, setStats] = useState(null)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> }
  ]

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    const response = await api.get(`/reports/dashboard?period=${period}`)
    setStats(response.data)
  }

  const handlePrint = () => window.print()
  const handleDownload = () => {
    const data = JSON.stringify(stats, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${period}-${new Date().toISOString()}.json`
    a.click()
  }

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab="dashboard" setActiveTab={() => {}}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard & Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small">
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </Box>

        {stats && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Tasks
                    </Typography>
                    <Typography variant="h3" component="div">
                      {stats.totalTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Completed
                    </Typography>
                    <Typography variant="h3" component="div" color="success.main">
                      {stats.completedTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h3" component="div" color="warning.main">
                      {stats.inProgressTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h3" component="div" color="error.main">
                      {stats.pendingTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Overview
                </Typography>
                <BarChart width={800} height={300} data={[
                  { name: 'Total', value: stats.totalTasks },
                  { name: 'Completed', value: stats.completedTasks },
                  { name: 'In Progress', value: stats.inProgressTasks },
                  { name: 'Pending', value: stats.pendingTasks }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#D32F2F" />
                </BarChart>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Layout>
  )
}

export default CEODashboard
