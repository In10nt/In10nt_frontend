import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { PhotoCamera, Edit } from '@mui/icons-material'
import api from '../../api/axios'

function AdminProfile({ user }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || ''
  })
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [tempPhoto, setTempPhoto] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        address: user.address || '',
        profilePicture: user.profilePicture || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put(`/users/${user.id}`, formData)
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Trigger a page reload to update the UI
      window.location.reload()
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    }
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTempPhoto(e.target.result)
        setPhotoDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSave = () => {
    setFormData({ ...formData, profilePicture: tempPhoto })
    setPhotoDialogOpen(false)
    setTempPhoto('')
  }

  const handlePhotoCancel = () => {
    setPhotoDialogOpen(false)
    setTempPhoto('')
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ color: '#000000', mb: 3 }}>
        Admin Profile
      </Typography>
      
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Profile Picture Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formData.profilePicture}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: '48px',
                  backgroundColor: '#c71f37',
                  border: '4px solid #f5f5f5'
                }}
              >
                {formData.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#c71f37',
                    color: 'white',
                    '&:hover': { backgroundColor: '#a01729' },
                    width: 40,
                    height: 40
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formData.fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {formData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role || 'Admin'} • System Administrator
              </Typography>
            </Box>
          </Box>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c71f37' },
                      '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c71f37' },
                      '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c71f37' },
                      '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c71f37' },
                      '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c71f37' },
                      '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Edit />}
                  sx={{ 
                    backgroundColor: '#c71f37', 
                    '&:hover': { backgroundColor: '#a01729' },
                    px: 4,
                    py: 1.5
                  }}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={photoDialogOpen} onClose={handlePhotoCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar
            src={tempPhoto}
            sx={{ 
              width: 200, 
              height: 200, 
              mx: 'auto',
              mb: 2,
              border: '4px solid #f5f5f5'
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Preview of your new profile picture
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhotoCancel}>Cancel</Button>
          <Button 
            onClick={handlePhotoSave}
            variant="contained"
            sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Save Photo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminProfile