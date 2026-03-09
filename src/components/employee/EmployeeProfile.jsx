import { useState } from 'react'
import axios from 'axios'
import { Camera } from 'lucide-react'

function EmployeeProfile({ user }) {
  const [formData, setFormData] = useState(user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.put(`/api/users/${user.id}`, formData)
    alert('Profile updated successfully')
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>My Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h3>{user.fullName}</h3>
            <p style={{ color: 'var(--text)' }}>{user.email}</p>
            <button className="btn btn-secondary" style={{ marginTop: '10px' }}>
              <Camera size={16} /> Change Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>Full Name</label>
            <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label>Phone</label>
            <input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label>Department</label>
            <input value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeProfile
