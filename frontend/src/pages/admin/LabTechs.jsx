import { useState, useEffect } from 'react'
import api from '../../api'
import { Edit, Trash2, Search, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLabTechs() {
  const [labtechs, setLabtechs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLabTech, setEditingLabTech] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    lab_name: '',
    lab_address: '',
    city: ''
  })

  useEffect(() => {
    fetchLabTechs()
  }, [])

  const fetchLabTechs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/all-labtechs')
      setLabtechs(res.data)
    } catch (err) {
      console.error('Error fetching lab techs:', err)
      toast.error('Failed to load lab technicians')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingLabTech) {
        await api.put(`/admin/labtechs/${editingLabTech.id}`, formData)
        toast.success('Lab Tech updated successfully')
      } else {
        await api.post('/admin/labtechs', formData)
        toast.success('Lab Tech added successfully')
      }
      setShowModal(false)
      setEditingLabTech(null)
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        lab_name: '',
        lab_address: '',
        city: ''
      })
      fetchLabTechs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await api.delete(`/admin/labtechs/${id}`)
      toast.success('Lab Tech deleted successfully')
      fetchLabTechs()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const openEditModal = (labtech) => {
    setEditingLabTech(labtech)
    setFormData({
      full_name: labtech.full_name,
      email: labtech.email,
      password: '',
      phone: labtech.phone || '',
      lab_name: labtech.lab_name || '',
      lab_address: labtech.lab_address || '',
      city: labtech.city || ''
    })
    setShowModal(true)
  }

  const filteredLabTechs = labtechs.filter(l => 
    l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Technician Management</h1>
          <p className="text-gray-500 mt-1">Manage all lab technicians in the system</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLabTechs} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={() => { setEditingLabTech(null); setShowModal(true) }} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Add Lab Tech
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Registered</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : filteredLabTechs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">No lab technicians found</td>
                </tr>
              ) : (
                filteredLabTechs.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{l.full_name}</p>
                      <p className="text-xs text-gray-500">{l.email}</p>
                    </td>
                    <td className="py-3 px-4">{l.email}</td>
                    <td className="py-3 px-4">{l.phone || 'N/A'}</td>
                    <td className="py-3 px-4">{l.created_at ? new Date(l.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(l)} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(l.id, l.full_name)} 
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingLabTech ? 'Edit Lab Technician' : 'Add New Lab Technician'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>

              {!editingLabTech && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.lab_name} 
                  onChange={(e) => setFormData({...formData, lab_name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Address</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.lab_address} 
                  onChange={(e) => setFormData({...formData, lab_address: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingLabTech ? 'Update' : 'Add'} Lab Tech
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingLabTech(null) }} 
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}