import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import TaskManagement from '../components/admin/TaskManagement'
import EmployeeManagement from '../components/admin/EmployeeManagement'
import LeaveManagement from '../components/admin/LeaveManagement'
import SalaryManagement from '../components/admin/SalaryManagement'
import InventoryManagement from '../components/admin/InventoryManagement'
import SubscriptionManagement from '../components/admin/SubscriptionManagement'
import ProjectManagement from '../components/admin/ProjectManagement'
import ProjectMembersManagement from '../components/admin/ProjectMembersManagement'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks')

  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'projects', label: 'Projects' },
    { id: 'projectMembers', label: 'Project Members' },
    { id: 'employees', label: 'Employees' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'salary', label: 'Salary' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'subscriptions', label: 'Subscriptions' }
  ]

  return (
    <Layout user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'tasks' && <TaskManagement />}
      {activeTab === 'projects' && <ProjectManagement />}
      {activeTab === 'projectMembers' && <ProjectMembersManagement />}
      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'leaves' && <LeaveManagement />}
      {activeTab === 'salary' && <SalaryManagement />}
      {activeTab === 'inventory' && <InventoryManagement />}
      {activeTab === 'subscriptions' && <SubscriptionManagement />}
    </Layout>
  )
}

export default AdminDashboard
