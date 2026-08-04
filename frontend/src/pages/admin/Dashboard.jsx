import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { 
  CheckCircle, XCircle, Users, Clock, Mail, Phone, 
  UserPlus, Search, RefreshCw, Stethoscope, Microscope
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [allDoctors, setAllDoctors] = useState([])
  const [allPatients, setAllPatients] = useState([])
  const [allLabTechs, setAllLabTechs] = useState([])
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0)
  const [pendingLabTechs, setPendingLabTechs] = useState([])
  const [pendingLabTechsCount, setPendingLabTechsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    specialization: '',
    hospital_name: '',
    consultation_fee: 2500
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [pendingRes, doctorsRes, patientsRes, labtechsRes, updatesRes, pendingLabTechsRes] = await Promise.all([
        api.get('/admin/pending-doctors'),
        api.get('/admin/all-doctors'),
        api.get('/admin/all-patients'),
        api.get('/admin/all-labtechs'),
        api.get('/admin/pending-profile-updates'),
        api.get('/admin/pending-labtechs')
      ])
      setPendingDoctors(pendingRes.data)
      setAllDoctors(doctorsRes.data)
      setAllPatients(patientsRes.data)
      setAllLabTechs(labtechsRes.data)
      setPendingUpdatesCount(updatesRes.data.length)
      setPendingLabTechs(pendingLabTechsRes.data)
      setPendingLabTechsCount(pendingLabTechsRes.data.length)
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId, doctorName) => {
    try {
      await api.post(`/admin/approve-doctor/${doctorId}`)
      toast.success(`Dr. ${doctorName} approved successfully!`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to approve doctor')
    }
  }

  const handleReject = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to reject Dr. ${doctorName}?`)) return
    try {
      await api.post(`/admin/reject-doctor/${doctorId}`)
      toast.success(`Dr. ${doctorName} rejected`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to reject doctor')
    }
  }

  const handleApproveLabTech = async (userId, userName) => {
    try {
      await api.post(`/admin/approve-labtech/${userId}`)
      toast.success(`${userName} approved successfully!`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to approve lab technician')
    }
  }

  const handleRejectLabTech = async (userId, userName) => {
    if (!confirm(`Are you sure you want to reject ${userName}?`)) return
    try {
      await api.post(`/admin/reject-labtech/${userId}`)
      toast.success(`${userName} rejected`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to reject lab technician')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/users', newUserForm)
      toast.success(`${newUserForm.full_name} added successfully`)
      setShowAddModal(false)
      setNewUserForm({
        full_name: '',
        email: '',
        password: '',
        role: 'doctor',
        phone: '',
        specialization: '',
        hospital_name: '',
        consultation_fee: 2500
      })
      fetchAllData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add user')
    }
  }

  const stats = [
    { label: 'Pending Doctors', value: pendingDoctors.length, icon: Clock, color: 'bg-yellow-100 text-yellow-600', onClick: () => setActiveTab('pending') },
    { label: 'Total Doctors', value: allDoctors.length, icon: Stethoscope, color: 'bg-blue-100 text-blue-600', onClick: () => navigate('/admin/doctors') },
    { label: 'Total Patients', value: allPatients.length, icon: Users, color: 'bg-green-100 text-green-600', onClick: () => navigate('/admin/patients') },
    { label: 'Lab Technicians', value: allLabTechs.length, icon: Microscope, color: 'bg-purple-100 text-purple-600', onClick: () => navigate('/admin/labtechs') },
    { label: 'Pending Updates', value: pendingUpdatesCount, icon: Clock, color: 'bg-orange-100 text-orange-600', onClick: () => navigate('/admin/pending-updates') },
    { label: 'Pending Lab Techs', value: pendingLabTechsCount, icon: Users, color: 'bg-indigo-100 text-indigo-600', onClick: () => setActiveTab('pendingLabTechs') },
  ]

  const filteredDoctors = pendingDoctors.filter(doctor => {
    if (!searchTerm) return true
    return doctor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredPendingLabTechs = pendingLabTechs.filter(tech => {
    if (!searchTerm) return true
    return tech.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tech.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage doctors, patients, and system settings</p>
          </div>
          <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} onClick={stat.onClick} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            Pending Doctors ({pendingDoctors.length})
          </button>
          <button onClick={() => setActiveTab('doctors')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            All Doctors ({allDoctors.length})
          </button>
          <button onClick={() => setActiveTab('patients')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'patients' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            Patients ({allPatients.length})
          </button>
          <button onClick={() => setActiveTab('labtechs')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'labtechs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            Lab Techs ({allLabTechs.length})
          </button>
          <button onClick={() => setActiveTab('pendingLabTechs')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'pendingLabTechs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            Pending Lab Techs ({pendingLabTechsCount})
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">PMDC License</th>
                  <th className="text-left py-3 px-4">Registered</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No pending approvals</td></tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{doctor.full_name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization || 'Hematologist'}</p>
                      </td>
                      <td className="py-3 px-4">{doctor.email}</td>
                      <td className="py-3 px-4"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{doctor.pmdc_license || 'Not provided'}</code></td>
                      <td className="py-3 px-4">{doctor.registered_at ? new Date(doctor.registered_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(doctor.id, doctor.full_name)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => handleReject(doctor.id, doctor.full_name)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            <XCircle size={14} /> Reject
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
      )}

      {activeTab === 'pendingLabTechs' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">AHPC Reg No</th>
                  <th className="text-left py-3 px-4">Lab/Hospital</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                ) : filteredPendingLabTechs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No pending lab technician verifications</td></tr>
                ) : (
                  filteredPendingLabTechs.map((tech) => (
                    <tr key={tech.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{tech.full_name}</p>
                        <p className="text-xs text-gray-500">{tech.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{tech.phone || 'N/A'}</p>
                        <p className="text-xs text-gray-500">CNIC: {tech.cnic || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{tech.ahpc_registration_no}</code>
                        <p className="text-xs text-gray-500 mt-1">Status: {tech.ahpc_status}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{tech.lab_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{tech.city}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveLabTech(tech.id, tech.full_name)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => handleRejectLabTech(tech.id, tech.full_name)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            <XCircle size={14} /> Reject
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
      )}
    </div>
  )
}