import { useState, useEffect } from 'react'
import axios from 'axios'
import { Edit, Search } from 'lucide-react'

function SalaryManagement() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [editingSalary, setEditingSalary] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm])

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees)
    } else {
      const filtered = employees.filter(employee =>
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmployees(filtered)
    }
  }

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
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#c71f37' 
          }} />
          <input
            type="text"
            placeholder="Search employees by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
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
            {filteredEmployees.map(emp => (
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
