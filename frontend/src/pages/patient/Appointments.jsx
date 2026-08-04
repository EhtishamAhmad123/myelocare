import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentsAPI } from '../../api'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, ChevronRight, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.mine()
      console.log('All appointments:', res.data)
      setAppointments(res.data)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  
  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'all') return true
    if (filter === 'upcoming') {
      return appt.status === 'pending' || appt.status === 'confirmed'
    }
    if (filter === 'past') {
      return appt.status === 'completed' || appt.status === 'cancelled'
    }
    return true
  })

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">View and manage all your scheduled consultations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'upcoming' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming ({appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'past' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Past ({appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').length})
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No appointments found</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Book Your First Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => navigate(`/patient/appointments/${apt.id}`)}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {apt.doctor_name || 'Doctor Appointment'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(apt.status)}`}>
                      {apt.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{apt.appointment_date ? format(new Date(apt.appointment_date), 'EEEE, MMMM dd, yyyy') : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{apt.appointment_date ? format(new Date(apt.appointment_date), 'h:mm a') : 'Time TBD'}</span>
                    </div>
                    {apt.hospital && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{apt.hospital}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {apt.has_lab_test && (
                    <div className="flex items-center gap-1 text-sm text-purple-600">
                      <FlaskConical size={14} />
                      <span>Lab Test</span>
                    </div>
                  )}
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}