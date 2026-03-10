import { useState, useRef, useEffect } from 'react'
import api from '../../api/axios'
import { Camera } from 'lucide-react'

function EmployeeProfile({ user }) {
  const [formData, setFormData] = useState(user)
  const [uploading, setUploading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user.profilePicture)
  const fileInputRef = useRef(null)

  // Update profile picture when user prop changes
  useEffect(() => {
    setProfilePicture(user.profilePicture)
  }, [user.profilePicture])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put(`/users/${user.id}`, formData)
      
      // Update localStorage with new user data
      const updatedUser = response.data
      const storedUser = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }))
      
      alert('Profile updated successfully')
    } catch (error) {
      alert('Error updating profile: ' + error.message)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result
        
        try {
          // Update user with base64 image
          const response = await api.put(`/users/${user.id}`, {
            ...formData,
            profilePicture: base64String
          })
          
          setProfilePicture(base64String)
          setFormData({ ...formData, profilePicture: base64String })
          
          // Update localStorage with new profile picture
          const storedUser = JSON.parse(localStorage.getItem('user'))
          const updatedUser = { ...storedUser, profilePicture: base64String }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          
          alert('Profile picture updated successfully!')
        } catch (error) {
          console.error('Upload error:', error)
          alert('Error uploading image: ' + (error.response?.data || error.message))
        } finally {
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        alert('Error reading file')
        setUploading(false)
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading image: ' + error.message)
      setUploading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>My Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ position: 'relative' }}>
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3>{user.fullName}</h3>
            <p style={{ color: 'var(--text)' }}>{user.email}</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '10px' }}
              onClick={handleFileSelect}
              disabled={uploading}
            >
              <Camera size={16} /> {uploading ? 'Uploading...' : 'Change Photo'}
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
