import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

function InventoryManagement() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    itemName: '', category: '', quantity: '', unitPrice: '', description: ''
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm])

  const filterInventory = () => {
    if (!searchTerm) {
      setFilteredInventory(inventory)
    } else {
      const filtered = inventory.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInventory(filtered)
    }
  }

  const fetchInventory = async () => {
    const response = await axios.get('/api/inventory')
    setInventory(response.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingItem) {
      await axios.put(`/api/inventory/${editingItem.id}`, formData)
    } else {
      await axios.post('/api/inventory', formData)
    }
    setShowForm(false)
    setEditingItem(null)
    setFormData({ itemName: '', category: '', quantity: '', unitPrice: '', description: '' })
    fetchInventory()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await axios.delete(`/api/inventory/${id}`)
      fetchInventory()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Inventory Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#c71f37' 
          }} />
          <input
            type="text"
            placeholder="Search inventory by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingItem ? 'Edit Item' : 'New Item'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder="Item Name" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
            <input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            <input type="number" step="0.01" placeholder="Unit Price" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })} />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ gridColumn: '1 / -1' }} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingItem(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>${item.unitPrice}</td>
                <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => { setEditingItem(item); setFormData(item); setShowForm(true); }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
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

export default InventoryManagement
