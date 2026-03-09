import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import TaskManagement from '../components/admin/TaskManagement'
import EmployeeManagement from '../components/admin/EmployeeManagement'
import LeaveManagement from '../components/admin/LeaveManagement'
import SalaryManagement from '../components/admin/SalaryManagement'
import InventoryManagement from '../components/admin/InventoryManagement'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks')

  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'employees', label: 'Employees' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'salary', label: 'Salary' },
    { id: 'inventory', label: 'Inventory' }
  ]

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'tasks' && <TaskManagement />}
      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'leaves' && <LeaveManagement />}
      {activeTab === 'salary' && <SalaryManagement />}
      {activeTab === 'inventory' && <InventoryManagement />}
    </Layout>
  )
}

export default AdminDashboard
