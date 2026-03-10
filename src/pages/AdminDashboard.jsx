import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import AdminDashboardView from '../components/admin/AdminDashboardView'
import TaskManagement from '../components/admin/TaskManagement'
import EmployeeManagement from '../components/admin/EmployeeManagement'
import LeaveManagement from '../components/admin/LeaveManagement'
import SalaryManagement from '../components/admin/SalaryManagement'
import InventoryManagement from '../components/admin/InventoryManagement'
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tasks', label: 'Tasks', icon: <AssignmentIcon /> },
    { id: 'employees', label: 'Employees', icon: <PeopleIcon /> },
    { id: 'leaves', label: 'Leaves', icon: <EventNoteIcon /> },
    { id: 'salary', label: 'Salary', icon: <AttachMoneyIcon /> },
    { id: 'inventory', label: 'Inventory', icon: <InventoryIcon /> }
  ]

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboardView />}
      {activeTab === 'tasks' && <TaskManagement />}
      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'leaves' && <LeaveManagement />}
      {activeTab === 'salary' && <SalaryManagement />}
      {activeTab === 'inventory' && <InventoryManagement />}
    </Layout>
  )
}

export default AdminDashboard
