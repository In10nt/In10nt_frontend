import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Check, X } from 'lucide-react'

function LeaveManagement() {
  const [leaves, setLeaves] = useState([])

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    const response = await api.get('/leaves')
    setLeaves(response.data)
  }

  const handleApprove = async (id) => {
    await api.put(`/leaves/${id}/approve`)
    fetchLeaves()
  }

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:')
    if (reason) {
      await api.put(`/leaves/${id}/reject`, reason)
      fetchLeaves()
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Leave Management</h2>
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
            {leaves.map(leave => (
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
