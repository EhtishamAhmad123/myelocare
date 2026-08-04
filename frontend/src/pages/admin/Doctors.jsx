import { useState, useEffect } from 'react'
import api from '../../api'
import { Edit, Trash2, Search, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Hematologist',
    hospital_name: '',
    consultation_fee: 2500,
    available_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    available_start: '09:00',
    available_end: '17:00'
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/all-doctors')
      setDoctors(res.data)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const toastId = toast.loading(editingDoctor ? 'Updating doctor...' : 'Adding doctor...')
  
  try {
    if (editingDoctor) {
      // For update, send to the correct endpoint
      const response = await api.put(`/admin/doctors/${editingDoctor.id}`, formData)
      if (response.data) {
        toast.success('Doctor updated successfully', { id: toastId })
      }
    } else {
      // For new doctor
      const response = await api.post('/admin/doctors', formData)
      if (response.data) {
        toast.success('Doctor added successfully', { id: toastId })
      }
    }
    setShowModal(false)
    setEditingDoctor(null)
    resetForm()
    fetchDoctors() // Refresh the list
  } catch (err) {
    console.error('Submit error:', err)
    const errorMsg = err.response?.data?.detail || (editingDoctor ? 'Failed to update doctor' : 'Failed to add doctor')
    toast.error(errorMsg, { id: toastId })
  }
}

const resetForm = () => {
  setFormData({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Hematologist',
    hospital_name: '',
    consultation_fee: 2500,
    available_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    available_start: '09:00',
    available_end: '17:00',
    city: 'Lahore'
  })
}

  const handleDelete = async (id, name) => {
  if (!confirm(`Are you sure you want to delete Dr. ${name}? This action cannot be undone.`)) return
  
  // Show loading state
  const toastId = toast.loading(`Deleting Dr. ${name}...`)
  
  try {
    // Use the correct endpoint
    const response = await api.delete(`/admin/doctors/${id}`)
    
    if (response.data.message) {
      toast.success(response.data.message, { id: toastId })
      fetchDoctors() // Refresh the list
    }
  } catch (err) {
    console.error('Delete error:', err)
    const errorMsg = err.response?.data?.detail || 'Failed to delete doctor'
    toast.error(errorMsg, { id: toastId })
  }
}

  const openEditModal = (doctor) => {
  console.log('Editing doctor:', doctor) // Debug log
  setEditingDoctor(doctor)
  setFormData({
    full_name: doctor.full_name || '',
    email: doctor.email || '',
    password: '',
    phone: doctor.phone || '',
    specialization: doctor.specialization || 'Hematologist',
    hospital_name: doctor.hospital_name || '',
    consultation_fee: doctor.consultation_fee || 2500,
    available_days: doctor.available_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
    available_start: doctor.available_start || '09:00',
    available_end: doctor.available_end || '17:00',
    city: doctor.city || 'Lahore'
  })
  setShowModal(true)
}

  const filteredDoctors = doctors.filter(d => 
    d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-500 mt-1">Manage all doctors in the system</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDoctors} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={() => { setEditingDoctor(null); setShowModal(true) }} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or specialization..." 
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Specialization</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hospital</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fee</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">No doctors found</td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{doc.full_name}</p>
                      <p className="text-xs text-gray-500">{doc.email}</p>
                    </td>
                    <td className="py-3 px-4">{doc.email}</td>
                    <td className="py-3 px-4">{doc.specialization || 'Hematologist'}</td>
                    <td className="py-3 px-4">{doc.hospital_name || 'N/A'}</td>
                    <td className="py-3 px-4">PKR {doc.consultation_fee?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(doc)} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(doc.id, doc.is_active !== false, doc.full_name)} 
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Toggle Status"
                        >
                          {doc.is_active !== false ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id, doc.full_name)} 
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
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
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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

              {!editingDoctor && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.specialization} 
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.hospital_name} 
                  onChange={(e) => setFormData({...formData, hospital_name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (PKR)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.consultation_fee} 
                  onChange={(e) => setFormData({...formData, consultation_fee: parseInt(e.target.value)})} 
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingDoctor ? 'Update' : 'Add'} Doctor
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingDoctor(null) }} 
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