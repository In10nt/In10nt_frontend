import { useState } from 'react'
import Layout from '../components/Layout'
import EmployeeTasks from '../components/employee/EmployeeTasks'
import EmployeeProfile from '../components/employee/EmployeeProfile'

function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks')

  const tabs = [
    { id: 'tasks', label: 'My Tasks' },
    { id: 'profile', label: 'Profile' }
  ]

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'tasks' && <EmployeeTasks userId={user.id} />}
      {activeTab === 'profile' && <EmployeeProfile user={user} />}
    </Layout>
  )
}

export default EmployeeDashboard
