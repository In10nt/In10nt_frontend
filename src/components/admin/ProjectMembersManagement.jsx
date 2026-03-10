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
  Autocomplete,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  InputAdornment
} from '@mui/material'
import { Add, Delete, Group, Folder, Search } from '@mui/icons-material'
import api from '../../api/axios'

function ProjectMembersManagement() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectMembers, setProjectMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [open, setOpen] = useState(false)
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    projectId: '',
    members: []
  })

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, projectSearchTerm])

  useEffect(() => {
    filterMembers()
  }, [projectMembers, memberSearchTerm])

  useEffect(() => {
    if (selectedProject) {
      fetchProjectMembers(selectedProject.id)
    } else {
      setProjectMembers([])
      setMemberSearchTerm('')
    }
  }, [selectedProject])

  const filterProjects = () => {
    if (!projectSearchTerm) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        project.manager?.fullName.toLowerCase().includes(projectSearchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }

  const filterMembers = () => {
    if (!memberSearchTerm) {
      setFilteredMembers(projectMembers)
    } else {
      const filtered = projectMembers.filter(member =>
        member.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(memberSearchTerm.toLowerCase())
      )
      setFilteredMembers(filtered)
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

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`)
      setProjectMembers(response.data.members || [])
      setMemberSearchTerm('') // Reset search when switching projects
    } catch (error) {
      console.error('Error fetching project members:', error)
    }
  }

  const handleAddMembers = async () => {
    try {
      const updatedProject = {
        ...selectedProject,
        members: [...projectMembers, ...formData.members]
      }
      await api.put(`/projects/${selectedProject.id}`, updatedProject)
      fetchProjectMembers(selectedProject.id)
      handleClose()
    } catch (error) {
      console.error('Error adding members:', error)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (confirm('Are you sure you want to remove this member from the project?')) {
      try {
        const updatedMembers = projectMembers.filter(member => member.id !== memberId)
        const updatedProject = {
          ...selectedProject,
          members: updatedMembers
        }
        await api.put(`/projects/${selectedProject.id}`, updatedProject)
        fetchProjectMembers(selectedProject.id)
      } catch (error) {
        console.error('Error removing member:', error)
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({
      projectId: '',
      members: []
    })
  }

  const getAvailableEmployees = () => {
    const memberIds = projectMembers.map(member => member.id)
    return employees.filter(emp => !memberIds.includes(emp.id))
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'CEO': return 'primary'
      case 'EMPLOYEE': return 'success'
      default: return 'default'
    }
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
      <Typography variant="h4" component="h1" sx={{ color: '#000000', mb: 3 }}>
        Project Members Management
      </Typography>

      <Grid container spacing={3}>
        {/* Projects List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Folder sx={{ color: '#c71f37' }} />
                Projects
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                placeholder="Search projects..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#c71f37' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredProjects.map((project) => (
                  <Box
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedProject?.id === project.id ? '#f5f5f5' : '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f9f9f9'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {project.members?.length || 0} members
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Members */}
        <Grid item xs={12} md={8}>
          {selectedProject ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group sx={{ color: '#c71f37' }} />
                      {selectedProject.name} - Team Members
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manager: {selectedProject.manager?.fullName || 'Unassigned'}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
                  >
                    Add Members
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#c71f37' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Member</strong></TableCell>
                        <TableCell><strong>Role</strong></TableCell>
                        <TableCell><strong>Department</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#c71f37' }}>
                                {member.fullName?.charAt(0)}
                              </Avatar>
                              <Typography variant="subtitle2">{member.fullName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={member.role}
                              color={getRoleColor(member.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{member.department || '-'}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <IconButton 
                              onClick={() => handleRemoveMember(member.id)} 
                              sx={{ color: '#c71f37' }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredMembers.length === 0 && projectMembers.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No members found matching your search.
                      </Typography>
                    </Box>
                  )}
                  {projectMembers.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No members assigned to this project yet.
                      </Typography>
                    </Box>
                  )}
                </TableContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Group sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a project to view and manage its members
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Add Members Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Members to {selectedProject?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              multiple
              options={getAvailableEmployees()}
              getOptionLabel={(option) => `${option.fullName} (${option.role})`}
              value={formData.members}
              onChange={(event, newValue) => setFormData({ ...formData, members: newValue })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Members to Add" 
                  placeholder="Choose employees..."
                />
              )}
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
            onClick={handleAddMembers}
            variant="contained"
            disabled={formData.members.length === 0}
            sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
          >
            Add {formData.members.length} Member{formData.members.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectMembersManagement