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
  Typography,
  Avatar,
  InputAdornment
} from '@mui/material'
import { Add, Edit, Delete, Person, Search } from '@mui/icons-material'
import api from '../../api/axios'

function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [open, setOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'EMPLOYEE',
    phone: '',
    address: '',
    department: '',
    salary: ''
  })

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
        employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmployees(filtered)
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
      if (editingEmployee) {
        await api.put(`/users/${editingEmployee.id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      handleClose()
      fetchEmployees()
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/users/${id}`)
        fetchEmployees()
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      email: employee.email,
      password: '',
      fullName: employee.fullName,
      role: employee.role,
      phone: employee.phone || '',
      address: employee.address || '',
      department: employee.department || '',
      salary: employee.salary || ''
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingEmployee(null)
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'EMPLOYEE',
      phone: '',
      address: '',
      department: '',
      salary: ''
    })
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'CEO': return 'primary'
      case 'EMPLOYEE': return 'success'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#000000' }}>
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ backgroundColor: '#c71f37', '&:hover': { backgroundColor: '#a01729' } }}
        >
          Add Employee
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search employees by name, email, role, or department..."
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
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Salary</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#c71f37' }}>
                      {employee.fullName?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2">{employee.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.role}
                    color={getRoleColor(employee.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{employee.department || '-'}</TableCell>
                <TableCell>{employee.phone || '-'}</TableCell>
                <TableCell>{employee.salary ? `$${employee.salary}` : '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(employee)} sx={{ color: '#c71f37' }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(employee.id)} sx={{ color: '#c71f37' }}>
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
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                fullWidth
              />
              
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />
              
              {!editingEmployee && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  fullWidth
                />
              )}
              
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="EMPLOYEE">Employee</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="CEO">CEO</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  fullWidth
                />
                
                <TextField
                  label="Salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  fullWidth
                />
              </Box>
              
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={2}
                fullWidth
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
              {editingEmployee ? 'Update' : 'Create'} Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default EmployeeManagement