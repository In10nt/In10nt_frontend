import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Plus, Edit, Trash2 } from 'lucide-react'

function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', address: '', department: '', salary: '', role: 'EMPLOYEE'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    const response = await api.get('/users')
    setEmployees(response.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingEmployee) {
      await api.put(`/users/${editingEmployee.id}`, formData)
    } else {
      await api.post('/users', formData)
    }
    setShowForm(false)
    setEditingEmployee(null)
    setFormData({ fullName: '', email: '', password: '', phone: '', address: '', department: '', salary: '', role: 'EMPLOYEE' })
    fetchEmployees()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this employee?')) {
      await api.delete(`/users/${id}`)
      fetchEmployees()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Employee Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingEmployee ? 'Edit Employee' : 'New Employee'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            <input type="number" placeholder="Salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
              <option value="CEO">CEO</option>
            </select>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingEmployee(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{emp.department}</td>
                <td>${emp.salary}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => { setEditingEmployee(emp); setFormData(emp); setShowForm(true); }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeManagement
