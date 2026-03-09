import { useState, useEffect } from 'react'
import axios from 'axios'
import { Edit } from 'lucide-react'

function SalaryManagement() {
  const [employees, setEmployees] = useState([])
  const [editingSalary, setEditingSalary] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    const response = await axios.get('/api/users')
    setEmployees(response.data)
  }

  const handleUpdateSalary = async (id, newSalary) => {
    await axios.put(`/api/users/${id}`, { salary: parseFloat(newSalary) })
    setEditingSalary(null)
    fetchEmployees()
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Salary Management</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Department</th>
              <th>Current Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>
                  {editingSalary === emp.id ? (
                    <input
                      type="number"
                      defaultValue={emp.salary}
                      onBlur={(e) => handleUpdateSalary(emp.id, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    `$${emp.salary || 0}`
                  )}
                </td>
                <td>
                  <button onClick={() => setEditingSalary(emp.id)}>
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalaryManagement
