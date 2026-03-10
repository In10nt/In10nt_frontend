import { useState, useEffect } from 'react'
import axios from 'axios'
import { Check, X, Search } from 'lucide-react'

function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [filteredLeaves, setFilteredLeaves] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
    filterLeaves()
  }, [leaves, searchTerm])

  const filterLeaves = () => {
    if (!searchTerm) {
      setFilteredLeaves(leaves)
    } else {
      const filtered = leaves.filter(leave =>
        leave.employee?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLeaves(filtered)
    }
  }

  const fetchLeaves = async () => {
    const response = await axios.get('/api/leaves')
    setLeaves(response.data)
  }

  const handleApprove = async (id) => {
    await axios.put(`/api/leaves/${id}/approve`)
    fetchLeaves()
  }

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:')
    if (reason) {
      await axios.put(`/api/leaves/${id}/reject`, reason)
      fetchLeaves()
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Leave Management</h2>
      
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
            placeholder="Search leaves by employee, type, status, or reason..."
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
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map(leave => (
              <tr key={leave.id}>
                <td>{leave.employee?.fullName}</td>
                <td>{leave.type}</td>
                <td>{leave.startDate}</td>
                <td>{leave.endDate}</td>
                <td>{leave.reason}</td>
                <td>{leave.status}</td>
                <td>
                  {leave.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleApprove(leave.id)} style={{ color: 'green' }}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleReject(leave.id)} style={{ color: 'red' }}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveManagement
