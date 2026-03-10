import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Plus, Edit, Trash2, Check } from 'lucide-react'

function TaskManagement() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'MEDIUM', assignedTo: null, dueDate: ''
  })

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [])

  const fetchTasks = async () => {
    const response = await api.get('/tasks')
    setTasks(response.data)
  }

  const fetchEmployees = async () => {
    const response = await api.get('/users')
    setEmployees(response.data.filter(u => u.role === 'EMPLOYEE'))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare the data for backend
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo ? { id: formData.assignedTo.id } : null,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
        status: 'PENDING',
        progress: 0
      }

      console.log('Sending task data:', taskData) // Debug log

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData)
      } else {
        await api.post('/tasks', taskData)
      }
      
      setShowForm(false)
      setEditingTask(null)
      setFormData({ title: '', description: '', priority: 'MEDIUM', assignedTo: null, dueDate: '' })
      fetchTasks()
    } catch (error) {
      console.error('Error saving task:', error)
      console.error('Error response:', error.response?.data)
      alert('Error saving task: ' + (error.response?.data || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
    }
  }

  const handleApprove = async (id) => {
    await api.put(`/tasks/${id}`, { status: 'APPROVED' })
    fetchTasks()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Task Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select
              value={formData.assignedTo?.id || ''}
              onChange={(e) => setFormData({ ...formData, assignedTo: employees.find(emp => emp.id === parseInt(e.target.value)) })}
            >
              <option value="">Assign to...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingTask(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.assignedTo?.fullName || 'Unassigned'}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>{task.dueDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => { setEditingTask(task); setFormData(task); setShowForm(true); }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(task.id)}>
                      <Trash2 size={16} />
                    </button>
                    {task.status === 'COMPLETED' && (
                      <button onClick={() => handleApprove(task.id)}>
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TaskManagement
