import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { Save, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    hospital_name: '',
    consultation_fee: '',
    available_days: '',
    available_start: '09:00',
    available_end: '17:00',
    specialization: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctor/profile')
      setProfile(res.data)
      setFormData({
        hospital_name: res.data.hospital_name || '',
        consultation_fee: res.data.consultation_fee || '',
        available_days: res.data.available_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
        available_start: res.data.available_start || '09:00',
        available_end: res.data.available_end || '17:00',
        specialization: res.data.specialization || 'Hematologist',
        phone: res.data.phone || '',
        bio: res.data.bio || ''
      })
    } catch (err) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/doctor/profile/request-update', {
        hospital_name: formData.hospital_name,
        consultation_fee: parseInt(formData.consultation_fee),
        available_days: formData.available_days,
        available_start: formData.available_start,
        available_end: formData.available_end,
        specialization: formData.specialization
      })
      toast.success('Profile update request submitted for admin approval')
      fetchProfile()
    } catch (err) {
      toast.error('Failed to submit update request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactUpdate = async () => {
    try {
      await api.put('/doctor/profile/update-contact', {
        phone: formData.phone,
        bio: formData.bio
      })
      toast.success('Contact info updated')
      fetchProfile()
    } catch (err) {
      toast.error('Failed to update contact info')
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-500 mb-6">Manage your professional information</p>

      {/* Verification Status */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          {profile?.is_verified ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-yellow-600" />
          )}
          <span className="font-medium">
            Status: {profile?.verification_status === 'approved' ? '✅ Verified' : '⏳ Pending Verification'}
          </span>
        </div>
        {profile?.profile_update_status === 'pending' && (
          <div className="mt-2 text-sm text-yellow-700 flex items-center gap-2">
            <Clock size={16} /> Profile update pending admin approval
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input bg-gray-100" value={user?.full_name} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input bg-gray-100" value={user?.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <button type="button" onClick={handleContactUpdate} className="mt-4 btn-secondary text-sm">Update Contact Info</button>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Professional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input type="text" className="input" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic Name</label>
              <input type="text" className="input" value={formData.hospital_name} onChange={(e) => setFormData({...formData, hospital_name: e.target.value})} placeholder="e.g., Doctors Hospital, Lahore" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (PKR)</label>
              <input type="number" className="input" value={formData.consultation_fee} onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})} placeholder="e.g., 2500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Days</label>
              <input type="text" className="input" value={formData.available_days} onChange={(e) => setFormData({...formData, available_days: e.target.value})} placeholder="Mon,Tue,Wed,Thu,Fri,Sat" />
              <p className="text-xs text-gray-500 mt-1">Separate days with commas (e.g., Mon,Tue,Wed)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" className="input" value={formData.available_start} onChange={(e) => setFormData({...formData, available_start: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" className="input" value={formData.available_end} onChange={(e) => setFormData({...formData, available_end: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
              <textarea rows="3" className="input" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell patients about your experience and expertise..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={submitting} className="btn-primary px-6 py-2">
            {submitting ? 'Submitting...' : 'Request Profile Update'}
          </button>
        </div>
      </form>
    </div>
  )
}