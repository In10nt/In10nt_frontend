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
  DialogActions,
  Chip,
  Divider,
  Paper,
  Fade,
  Snackbar,
  Alert
} from '@mui/material'
import { 
  PhotoCamera, 
  Edit, 
  Person, 
  Email, 
  Phone, 
  Business, 
  LocationOn,
  Save,
  Cancel
} from '@mui/icons-material'
import api from '../../api/axios'

function EmployeeProfile({ user }) {
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
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Phone validation function
  const validatePhone = (phone) => {
    if (!phone) return true
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return false
    }
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,20}$/
    return phoneRegex.test(phone)
  }

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const cleanValue = value.replace(/\D/g, '')
    const limitedValue = cleanValue.slice(0, 15)
    
    if (limitedValue.length <= 3) {
      return limitedValue
    } else if (limitedValue.length <= 6) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`
    } else if (limitedValue.length <= 10) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3, 6)}-${limitedValue.slice(6)}`
    } else {
      return `+${limitedValue.slice(0, -10)} ${limitedValue.slice(-10, -7)}-${limitedValue.slice(-7, -4)}-${limitedValue.slice(-4)}`
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    const formattedPhone = formatPhoneNumber(value)
    
    setFormData({ ...formData, phone: formattedPhone })
    
    if (value && !validatePhone(formattedPhone)) {
      setErrors({ ...errors, phone: 'Please enter a valid phone number (10-15 digits)' })
    } else {
      const newErrors = { ...errors }
      delete newErrors.phone
      setErrors(newErrors)
    }
  }

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
    
    if (formData.phone && !validatePhone(formData.phone)) {
      setErrors({ ...errors, phone: 'Please enter a valid phone number' })
      return
    }
    
    setLoading(true)
    try {
      console.log('Updating user with data:', formData)
      console.log('User ID:', user.id)
      
      const response = await api.put(`/users/${user.id}`, formData)
      console.log('Update response:', response.data)
      
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Dispatch custom event to update App state
      window.dispatchEvent(new Event('userUpdated'))
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' })
      setIsEditing(false)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMessage = 'Error updating profile. Please try again.'
      if (error.response?.status === 413) {
        errorMessage = 'Profile picture is too large. Please use a smaller image.'
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.'
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please refresh and try again.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Image size should be less than 5MB', severity: 'error' })
        return
      }
      
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
    setSnackbar({ open: true, message: 'Profile picture updated! Remember to save changes.', severity: 'info' })
  }

  const handlePhotoCancel = () => {
    setPhotoDialogOpen(false)
    setTempPhoto('')
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      address: user?.address || '',
      profilePicture: user?.profilePicture || ''
    })
    setIsEditing(false)
    setErrors({})
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                color: '#000000', 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #c71f37, #a01729)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              My Profile
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your personal information and preferences
            </Typography>
          </Box>

          {/* Profile Header Card */}
          <Paper 
            elevation={0}
            sx={{ 
              background: 'linear-gradient(135deg, #c71f37 0%, #a01729 100%)',
              borderRadius: 4,
              p: 4,
              mb: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={formData.profilePicture}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        fontSize: '48px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        border: '4px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
                          bottom: -5,
                          right: -5,
                          backgroundColor: 'white',
                          color: '#c71f37',
                          '&:hover': { 
                            backgroundColor: '#f5f5f5',
                            transform: 'scale(1.1)'
                          },
                          width: 40,
                          height: 40,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  </Box>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formData.fullName || 'Employee Name'}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    {formData.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={user?.role || 'Employee'} 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                    {formData.department && (
                      <Chip 
                        label={formData.department} 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          color: 'white'
                        }} 
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      px: 3,
                      py: 1.5
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                zIndex: 1
              }}
            />
          </Paper>

          {/* Profile Form */}
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#c71f37' }}>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      disabled={!isEditing}
                      slotProps={{
                        input: {
                          startAdornment: <Person sx={{ color: '#c71f37', mr: 1 }} />
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#c71f37' },
                          '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!isEditing}
                      slotProps={{
                        input: {
                          startAdornment: <Email sx={{ color: '#c71f37', mr: 1 }} />
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#c71f37' },
                          '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      error={!!errors.phone}
                      helperText={errors.phone || 'Format: 123-456-7890'}
                      placeholder="123-456-7890"
                      disabled={!isEditing}
                      slotProps={{
                        input: {
                          startAdornment: <Phone sx={{ color: '#c71f37', mr: 1 }} />,
                          maxLength: 20
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#c71f37' },
                          '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      disabled={!isEditing}
                      slotProps={{
                        input: {
                          startAdornment: <Business sx={{ color: '#c71f37', mr: 1 }} />
                        }
                      }}
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
                      disabled={!isEditing}
                      slotProps={{
                        input: {
                          startAdornment: <LocationOn sx={{ color: '#c71f37', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#c71f37' },
                          '&.Mui-focused fieldset': { borderColor: '#c71f37' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#c71f37' }
                      }}
                    />
                  </Grid>
                  
                  {isEditing && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          startIcon={<Cancel />}
                          sx={{
                            borderColor: '#c71f37',
                            color: '#c71f37',
                            '&:hover': {
                              borderColor: '#a01729',
                              backgroundColor: 'rgba(199, 31, 55, 0.04)'
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={!!errors.phone || loading}
                          sx={{ 
                            backgroundColor: '#c71f37', 
                            '&:hover': { backgroundColor: '#a01729' },
                            '&:disabled': { backgroundColor: '#ccc' },
                            px: 4,
                            py: 1.5
                          }}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Photo Preview Dialog */}
      <Dialog open={photoDialogOpen} onClose={handlePhotoCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          Update Profile Picture
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar
            src={tempPhoto}
            sx={{ 
              width: 200, 
              height: 200, 
              mx: 'auto',
              mb: 2,
              border: '4px solid #f5f5f5',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Preview of your new profile picture
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handlePhotoCancel}
            variant="outlined"
            sx={{
              borderColor: '#c71f37',
              color: '#c71f37'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePhotoSave}
            variant="contained"
            sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Save Photo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EmployeeProfile