import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentsAPI } from '../../api'
import { Calendar, Clock, Users, FlaskConical, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { format, isBefore, isAfter, startOfDay } from 'date-fns'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.mine()
      console.log('Fetched appointments:', res.data)
      setAppointments(res.data)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const today = startOfDay(new Date())
  
  // Categorize appointments
  const pendingAppointments = appointments.filter(a => a.status === 'pending')
  const completedAppointments = appointments.filter(a => a.status === 'completed')
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled')
  
  // Check for past appointments that are still pending (no-shows)
  const pastPendingAppointments = pendingAppointments.filter(a => 
    a.appointment_date && isBefore(new Date(a.appointment_date), today)
  )
  
  const upcomingAppointments = pendingAppointments.filter(a => 
    a.appointment_date && isAfter(new Date(a.appointment_date), today)
  )
  
  const todayAppointments = appointments.filter(a => 
    a.appointment_date && format(new Date(a.appointment_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  )

  const getStatusBadge = (status, appointmentDate) => {
    const isPast = appointmentDate && isBefore(new Date(appointmentDate), today)
    
    if (status === 'completed') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
    }
    if (status === 'cancelled') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>
    }
    if (isPast && status === 'pending') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">No Show</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Upcoming</span>
  }

  // Navigation handlers
  const goToAllAppointments = () => navigate('/doctor/appointments')
  const goToTodayAppointments = () => navigate('/doctor/appointments?filter=today')
  const goToUpcomingAppointments = () => navigate('/doctor/appointments?filter=upcoming')
  const goToCompletedAppointments = () => navigate('/doctor/appointments?filter=completed')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.full_name} 👨‍⚕️</h1>
        <p className="text-gray-500 mt-1">Manage your appointments and patient care</p>
      </div>

      {/* Stats Cards - CLICKABLE */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div onClick={goToAllAppointments} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-gray-900">{appointments.length}</p><p className="text-sm text-gray-500">Total</p></div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
          </div>
        </div>
        <div onClick={goToTodayAppointments} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p><p className="text-sm text-gray-500">Today</p></div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Clock size={20} className="text-green-600" /></div>
          </div>
        </div>
        <div onClick={goToUpcomingAppointments} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p><p className="text-sm text-gray-500">Upcoming</p></div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Users size={20} className="text-yellow-600" /></div>
          </div>
        </div>
        <div onClick={goToCompletedAppointments} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p><p className="text-sm text-gray-500">Completed</p></div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><CheckCircle size={20} className="text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-red-600">{pastPendingAppointments.length}</p><p className="text-sm text-gray-500">No Shows</p></div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><XCircle size={20} className="text-red-600" /></div>
          </div>
        </div>
      </div>

      {/* Today's Appointments List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-semibold text-gray-900">Today's Appointments</h2>
          {todayAppointments.length > 0 && <button onClick={() => navigate('/doctor/appointments')} className="text-sm text-blue-600 hover:underline">View All →</button>}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No appointments scheduled for today</div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div key={apt.id} onClick={() => navigate(`/doctor/appointments/${apt.id}`)} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name || 'Patient'}</p>
                    <p className="text-sm text-gray-500">{apt.appointment_date ? format(new Date(apt.appointment_date), 'h:mm a') : 'Time TBD'}</p>
                    {getStatusBadge(apt.status, apt.appointment_date)}
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No Shows Alert */}
      {pastPendingAppointments.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />
            <p className="text-sm text-red-700">
              <strong>{pastPendingAppointments.length} appointment(s)</strong> from past dates are still pending. 
              These will be automatically marked as "No Show" after the scheduled date passes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}