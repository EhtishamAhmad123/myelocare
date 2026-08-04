import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { User, Building2, MapPin, Phone, Mail, Upload, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LabTechProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    lab_name: '',
    lab_address: '',
    city: '',
    phone: '',
    bio: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/labtech/profile')
      setProfile(res.data)
      setFormData({
        lab_name: res.data.lab_name || '',
        lab_address: res.data.lab_address || '',
        city: res.data.city || '',
        phone: res.data.phone || '',
        bio: res.data.bio || ''
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      // Update profile info
      await api.put('/labtech/profile', formData)
      
      // Upload image if selected
      if (profileImage) {
        const formDataImg = new FormData()
        formDataImg.append('profile_image', profileImage)
        await api.post('/labtech/upload-profile-image', formDataImg)
      }
      
      toast.success('Profile updated successfully')
      fetchProfile()
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-500 mb-6">Manage your laboratory information and credentials</p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Image Upload */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : profile?.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow-lg">
                <Upload size={14} className="text-gray-600" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.full_name}</h2>
              <p className="text-blue-100">AHPC Registered Medical Laboratory Technologist</p>
              {profile?.verification_status === 'approved' && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-500 rounded-full">Verified</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 size={14} className="inline mr-1" /> Lab Name
              </label>
              <input
                type="text"
                className="input"
                value={formData.lab_name}
                onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={14} className="inline mr-1" /> City
              </label>
              <input
                type="text"
                className="input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Address</label>
            <textarea
              rows={2}
              className="input"
              value={formData.lab_address}
              onChange={(e) => setFormData({ ...formData, lab_address: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={14} className="inline mr-1" /> Phone
              </label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={14} className="inline mr-1" /> Email
              </label>
              <input type="email" className="input bg-gray-100" value={user?.email} disabled />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About / Bio</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Describe your laboratory, experience, and specialties..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Verification Status</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">AHPC Registration:</span> {profile?.ahpc_registration_no}</p>
              <p><span className="text-gray-500">Status:</span> 
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  profile?.verification_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile?.verification_status || 'pending'}
                </span>
              </p>
            </div>
          </div>

          <button type="submit" disabled={updating} className="btn-primary w-full py-2.5">
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}