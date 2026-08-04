import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentsAPI } from '../../api'
import { Calendar, Clock, FlaskConical, ChevronRight, Plus, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function PatientDashboard() {
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
    } finally {
      setLoading(false)
    }
  }

  const totalAppointments = appointments.length
  const upcomingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
  const labTestsCount = appointments.filter(a => a.has_lab_test).length
  const recentAppointments = appointments.slice(0, 3)

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  // Navigation handlers
  const goToAllAppointments = () => {
    console.log('Navigating to all appointments')
    navigate('/patient/appointments')
  }

  const goToUpcomingAppointments = () => {
    console.log('Navigating to upcoming appointments')
    navigate('/patient/appointments')
  }

  const goToLabTests = () => {
    console.log('Navigating to lab tests')
    navigate('/patient/results')
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 👋</h1>
        <p className="text-gray-500 mt-1">Manage your appointments and view test results</p>
      </div>

      {/* Stats Cards - NOW ALL CLICKABLE */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Total Appointments Card - Shows ALL appointments */}
        <div 
          onClick={goToAllAppointments}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalAppointments}</p>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Card - Shows pending/confirmed appointments */}
        <div 
          onClick={goToUpcomingAppointments}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{upcomingAppointments}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Lab Tests Card */}
        <div 
          onClick={goToLabTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{labTestsCount}</p>
              <p className="text-sm text-gray-500">Lab Tests</p>
              <p className="text-xs text-gray-400 mt-1">Click to view results</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FlaskConical size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => navigate('/patient/doctors')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all text-left flex items-center justify-between group"
        >
          <div>
            <p className="font-semibold text-gray-900">Find a Doctor</p>
            <p className="text-sm text-gray-500">Book an appointment with a hematologist</p>
          </div>
          <Plus size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => navigate('/patient/results')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all text-left flex items-center justify-between group"
        >
          <div>
            <p className="font-semibold text-gray-900">View Test Results</p>
            <p className="text-sm text-gray-500">Check your MM diagnosis results</p>
          </div>
          <FileText size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center p-6 pb-3">
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
          <button 
            onClick={() => navigate('/patient/appointments')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="p-6 pt-0">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No appointments yet</p>
              <button 
                onClick={() => navigate('/patient/doctors')} 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appt) => (
                <div 
                  key={appt.id} 
                  onClick={() => navigate(`/patient/appointments/${appt.id}`)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-gray-900">{appt.doctor_name || 'Doctor'}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(appt.status)}`}>
                        {appt.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{appt.hospital || 'Hospital'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {appt.appointment_date ? format(new Date(appt.appointment_date), 'MMM dd, yyyy, h:mm a') : 'Date TBD'}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}