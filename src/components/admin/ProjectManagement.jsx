import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
  InputAdornment
} from '@mui/material'
import { Add, Edit, Delete, Folder, Search } from '@mui/icons-material'
import api from '../../api/axios'

function ProjectManagement() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [open, setOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    manager: null,
    members: []
  })

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm])

  const filterProjects = () => {
    if (!searchTerm) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData)
      } else {
        await api.post('/projects', formData)
      }
      handleClose()
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`)
        fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate,
      endDate: project.endDate || '',
      status: project.status,
      manager: project.manager,
      members: project.members || []
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingProject(null)
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      manager: null,
      members: []
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'COMPLETED': return 'primary'
      case 'ON_HOLD': return 'warning'
      case 'CANCELLED': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#000000' }}>
          Project Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
        >
          Add Project
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects by name, description, manager, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#c71f37' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#c71f37',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#c71f37',
              },
            },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Project Name</strong></TableCell>
              <TableCell><strong>Manager</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Folder sx={{ color: '#c71f37' }} />
                    <Box>
                      <Typography variant="subtitle2">{project.name}</Typography>
                      {project.description && (
                        <Typography variant="caption" color="text.secondary">
                          {project.description.substring(0, 50)}...
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{project.manager?.fullName || 'Unassigned'}</TableCell>
                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(project)} sx={{ color: '#c71f37' }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(project.id)} sx={{ color: '#c71f37' }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
                
                <TextField
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.fullName} (${option.role})`}
                value={formData.manager}
                onChange={(event, newValue) => setFormData({ ...formData, manager: newValue })}
                renderInput={(params) => <TextField {...params} label="Project Manager" />}
              />
              
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => `${option.fullName} (${option.role})`}
                value={formData.members}
                onChange={(event, newValue) => setFormData({ ...formData, members: newValue })}
                renderInput={(params) => <TextField {...params} label="Team Members" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.fullName}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
            >
              {editingProject ? 'Update' : 'Create'} Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default ProjectManagement