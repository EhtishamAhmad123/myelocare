import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { appointmentsAPI } from '../../api'
import { format, isBefore, isAfter, startOfDay } from 'date-fns'
import { Calendar, Clock, ChevronRight, CheckCircle, XCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter === 'today') setActiveFilter('today')
    else if (filter === 'upcoming') setActiveFilter('upcoming')
    else if (filter === 'completed') setActiveFilter('completed')
    else setActiveFilter('all')
    
    fetchAppointments()
  }, [searchParams])

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.mine()
      setAppointments(res.data)
      applyFilter(res.data, activeFilter)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = (data, filter) => {
    const today = startOfDay(new Date())
    let filtered = [...data]
    
    if (filter === 'today') {
      filtered = data.filter(a => a.appointment_date && format(new Date(a.appointment_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    } else if (filter === 'upcoming') {
      filtered = data.filter(a => a.status === 'pending' && a.appointment_date && isAfter(new Date(a.appointment_date), today))
    } else if (filter === 'completed') {
      filtered = data.filter(a => a.status === 'completed')
    }
    
    setFilteredAppointments(filtered)
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    applyFilter(appointments, filter)
  }

  const getStatusBadge = (status, appointmentDate) => {
    const today = startOfDay(new Date())
    const isPast = appointmentDate && isBefore(new Date(appointmentDate), today)
    
    if (status === 'completed') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"><CheckCircle size={12} className="inline mr-1" /> Completed</span>
    }
    if (status === 'cancelled') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"><XCircle size={12} className="inline mr-1" /> Cancelled</span>
    }
    if (isPast && status === 'pending') {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"><XCircle size={12} className="inline mr-1" /> No Show</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
  }

  const allCount = appointments.length
  const todayCount = appointments.filter(a => a.appointment_date && format(new Date(a.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length
  const upcomingCount = appointments.filter(a => a.status === 'pending' && a.appointment_date && isAfter(new Date(a.appointment_date), startOfDay(new Date()))).length
  const completedCount = appointments.filter(a => a.status === 'completed').length

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">Manage your patient consultations</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All ({allCount})</button>
        <button onClick={() => handleFilterChange('today')} className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'today' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Today ({todayCount})</button>
        <button onClick={() => handleFilterChange('upcoming')} className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'upcoming' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Upcoming ({upcomingCount})</button>
        <button onClick={() => handleFilterChange('completed')} className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Completed ({completedCount})</button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center"><Calendar size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No appointments found</p></div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} onClick={() => navigate(`/doctor/appointments/${apt.id}`)} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{apt.patient_name || 'Patient'}</h3>
                    {getStatusBadge(apt.status, apt.appointment_date)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /><span>{apt.appointment_date ? format(new Date(apt.appointment_date), 'EEEE, MMMM dd, yyyy') : 'Date TBD'}</span></div>
                    <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span>{apt.appointment_date ? format(new Date(apt.appointment_date), 'h:mm a') : 'Time TBD'}</span></div>
                    {apt.notes && <div className="text-gray-500 text-sm">📝 {apt.notes.substring(0, 50)}...</div>}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}