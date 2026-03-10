import { useState } from 'react'
import Layout from '../components/Layout'
import EmployeeDashboardView from '../components/employee/EmployeeDashboardView'
import EmployeeTasks from '../components/employee/EmployeeTasks'
import EmployeeProfile from '../components/employee/EmployeeProfile'
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from '@mui/icons-material'

function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tasks', label: 'My Tasks', icon: <AssignmentIcon /> },
    { id: 'profile', label: 'Profile', icon: <PersonIcon /> }
  ]

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <EmployeeDashboardView userId={user.id} />}
      {activeTab === 'tasks' && <EmployeeTasks userId={user.id} />}
      {activeTab === 'profile' && <EmployeeProfile user={user} />}
    </Layout>
  )
}

export default EmployeeDashboard
