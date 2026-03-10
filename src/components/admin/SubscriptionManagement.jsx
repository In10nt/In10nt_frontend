import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Plus, Edit, Trash2, AlertTriangle, Calendar } from 'lucide-react'

function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([])
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [expiringSoon, setExpiringSoon] = useState([])
  const [formData, setFormData] = useState({
    serviceName: '',
    provider: '',
    description: '',
    startDate: '',
    endDate: '',
    cost: '',
    status: 'ACTIVE',
    assignedTo: null,
    notes: ''
  })

  useEffect(() => {
    fetchSubscriptions()
    fetchEmployees()
    fetchExpiringSoon()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions')
      setSubscriptions(response.data)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users')
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchExpiringSoon = async () => {
    try {
      const response = await api.get('/subscriptions/expiring-soon')
      setExpiringSoon(response.data)
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSubscription) {
        await api.put(`/subscriptions/${editingSubscription.id}`, formData)
      } else {
        await api.post('/subscriptions', formData)
      }
      setShowForm(false)
      setEditingSubscription(null)
      resetForm()
      fetchSubscriptions()
      fetchExpiringSoon()
    } catch (error) {
      console.error('Error saving subscription:', error)
      alert('Error saving subscription')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        await api.delete(`/subscriptions/${id}`)
        fetchSubscriptions()
        fetchExpiringSoon()
      } catch (error) {
        console.error('Error deleting subscription:', error)
        alert('Error deleting subscription')
      }
    }
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      serviceName: subscription.serviceName,
      provider: subscription.provider,
      description: subscription.description || '',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      cost: subscription.cost,
      status: subscription.status,
      assignedTo: subscription.assignedTo,
      notes: subscription.notes || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      serviceName: '',
      provider: '',
      description: '',
      startDate: '',
      endDate: '',
      cost: '',
      status: 'ACTIVE',
      assignedTo: null,
      notes: ''
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#4CAF50'
      case 'EXPIRED': return '#f44336'
      case 'CANCELLED': return '#9E9E9E'
      case 'PENDING_RENEWAL': return '#FF9800'
      default: return '#2196F3'
    }
  }

  const isExpiringSoon = (endDate) => {
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Subscription Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Subscription
        </button>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={20} color="#856404" />
          <div>
            <strong>Subscriptions Expiring Soon:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              {expiringSoon.map(sub => (
                <li key={sub.id}>
                  {sub.serviceName} expires on {formatDate(sub.endDate)}
                  {sub.assignedTo && ` (Assigned to: ${sub.assignedTo.fullName})`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Subscription Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingSubscription ? 'Edit Subscription' : 'New Subscription'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input
              placeholder="Service Name"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              required
            />
            <input
              placeholder="Provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              style={{ gridColumn: '1 / -1' }}
            />
            <input
              type="date"
              placeholder="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="End Date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              required
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING_RENEWAL">Pending Renewal</option>
            </select>
            <select
              value={formData.assignedTo?.id || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                assignedTo: employees.find(emp => emp.id === parseInt(e.target.value)) || null 
              })}
              style={{ gridColumn: '1 / -1' }}
            >
              <option value="">Assign to...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.role})</option>
              ))}
            </select>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              style={{ gridColumn: '1 / -1' }}
            />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingSubscription ? 'Update' : 'Create'} Subscription
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { 
                  setShowForm(false); 
                  setEditingSubscription(null); 
                  resetForm(); 
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Provider</th>
              <th>Assigned To</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(subscription => (
              <tr key={subscription.id} style={{ 
                backgroundColor: isExpiringSoon(subscription.endDate) ? '#fff3cd' : 'transparent' 
              }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {subscription.serviceName}
                    {isExpiringSoon(subscription.endDate) && (
                      <AlertTriangle size={16} color="#856404" title="Expiring Soon" />
                    )}
                  </div>
                </td>
                <td>{subscription.provider}</td>
                <td>{subscription.assignedTo?.fullName || 'Unassigned'}</td>
                <td>{formatDate(subscription.startDate)}</td>
                <td>{formatDate(subscription.endDate)}</td>
                <td>${subscription.cost}</td>
                <td>
                  <span style={{ 
                    color: getStatusColor(subscription.status),
                    fontWeight: 'bold'
                  }}>
                    {subscription.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => handleEdit(subscription)}
                      title="Edit"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(subscription.id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No subscriptions found. Click "Add Subscription" to create one.
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionManagement