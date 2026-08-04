import { useState, useEffect } from 'react'
import api from '../../api'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PendingUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      const res = await api.get('/admin/pending-profile-updates')
      setUpdates(res.data)
    } catch (err) {
      toast.error('Failed to load pending updates')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doctorId, doctorName) => {
    try {
      await api.post(`/admin/approve-profile-update/${doctorId}`)
      toast.success(`Profile update approved for Dr. ${doctorName}`)
      fetchUpdates()
    } catch (err) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (doctorId, doctorName) => {
    try {
      await api.post(`/admin/reject-profile-update/${doctorId}`)
      toast.success(`Profile update rejected for Dr. ${doctorName}`)
      fetchUpdates()
    } catch (err) {
      toast.error('Failed to reject')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Profile Updates</h1>
      <p className="text-gray-500 mb-6">Review and approve doctor profile change requests</p>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No pending profile updates</div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.doctor_id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{update.doctor_name}</h3>
                  <p className="text-sm text-gray-500">{update.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(update.doctor_id, update.doctor_name)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(update.doctor_id, update.doctor_name)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-700 mb-2">Current Values</p>
                  <p>🏥 Hospital: {update.current.hospital_name || 'N/A'}</p>
                  <p>💰 Fee: PKR {update.current.consultation_fee || 0}</p>
                  <p>📅 Days: {update.current.available_days || 'N/A'}</p>
                  <p>⏰ Time: {update.current.available_start || 'N/A'} - {update.current.available_end || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="font-medium text-yellow-700 mb-2">Pending Changes</p>
                  <p>🏥 Hospital: {update.pending.hospital_name || 'N/A'}</p>
                  <p>💰 Fee: PKR {update.pending.consultation_fee || 0}</p>
                  <p>📅 Days: {update.pending.available_days || 'N/A'}</p>
                  <p>⏰ Time: {update.pending.available_start || 'N/A'} - {update.pending.available_end || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}