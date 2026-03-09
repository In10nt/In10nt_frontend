import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Download, Printer } from 'lucide-react'
import './CEODashboard.css'

function CEODashboard({ user, onLogout }) {
  const [period, setPeriod] = useState('monthly')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    const response = await axios.get(`/api/reports/dashboard?period=${period}`)
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
    <Layout user={user} onLogout={onLogout}>
      <div className="ceo-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard & Reports</h1>
          <div className="actions">
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={handlePrint} className="btn btn-secondary">
              <Printer size={16} /> Print
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <p className="stat-value">{stats.totalTasks}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value">{stats.completedTasks}</p>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <p className="stat-value">{stats.inProgressTasks}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-value">{stats.pendingTasks}</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3>Task Overview</h3>
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
                <Bar dataKey="value" fill="#E91E63" />
              </BarChart>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default CEODashboard
