import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { appointmentsAPI } from '../../api'
import api from '../../api'
import { format, addDays, startOfDay } from 'date-fns'
import { ArrowLeft, Calendar, Clock, MapPin, FlaskConical, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  // Generate next 14 days for reschedule date picker
  const generateDateOptions = () => {
    const dates = []
    const today = startOfDay(new Date())
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }

  // Generate time slots (9 AM to 5 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) continue
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const dateOptions = generateDateOptions()
  const timeSlots = generateTimeSlots()

  const fetchAppointment = async () => {
    try {
      const res = await appointmentsAPI.get(id)
      console.log('Appointment data:', res.data)
      setAppointment(res.data)
    } catch (err) {
      console.error('Error fetching appointment:', err)
      toast.error('Failed to load appointment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast.error('Please select both new date and time')
      return
    }

    setRescheduling(true)
    try {
      const newDateTime = new Date(`${newDate}T${newTime}:00`)
      const response = await api.put(`/appointments/${id}/reschedule`, { 
        new_date: newDateTime.toISOString() 
      })
      
      toast.success(response.data.message)
      setShowReschedule(false)
      setNewDate('')
      setNewTime('')
      fetchAppointment() // Refresh appointment data
    } catch (err) {
      console.error('Reschedule error:', err)
      toast.error(err.response?.data?.detail || 'Failed to reschedule appointment')
    } finally {
      setRescheduling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!appointment) return null

  const result = appointment.lab_test?.result
  const remainingReschedules = appointment.reschedule_count !== undefined ? 2 - appointment.reschedule_count : 2

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Appointments
      </button>

      {/* Appointment Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
          {appointment.status === 'pending' && appointment.reschedule_count < 2 && (
            <button
              onClick={() => setShowReschedule(!showReschedule)}
              className="flex items-center gap-2 text-sm bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Edit2 size={14} />
              Reschedule ({remainingReschedules} left)
            </button>
          )}
        </div>

        {/* Reschedule Form */}
        {showReschedule && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3">Reschedule Appointment</h3>
            <p className="text-sm text-yellow-700 mb-3">
              You have {remainingReschedules} reschedule attempt(s) remaining. Max 2 attempts allowed.
            </p>
            
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <select 
                  className="input w-full"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                >
                  <option value="">Select date</option>
                  {dateOptions.map((date) => (
                    <option key={date.toISOString()} value={format(date, 'yyyy-MM-dd')}>
                      {format(date, 'EEEE, MMMM dd, yyyy')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <select 
                  className="input w-full"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {rescheduling ? 'Processing...' : 'Confirm Reschedule'}
              </button>
              <button
                onClick={() => setShowReschedule(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor</span>
            <span className="font-medium">{appointment.doctor?.name || 'Doctor'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Hospital</span>
            <span>{appointment.doctor?.hospital || 'Hospital'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date & Time</span>
            <span>{appointment.appointment_date ? format(new Date(appointment.appointment_date), 'PPP p') : 'TBD'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`capitalize font-medium ${
              appointment.status === 'pending' ? 'text-yellow-600' :
              appointment.status === 'confirmed' ? 'text-green-600' :
              appointment.status === 'completed' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {appointment.status}
            </span>
          </div>
          {appointment.reschedule_count !== undefined && appointment.reschedule_count > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Times Rescheduled</span>
              <span className="text-orange-600">{appointment.reschedule_count} / 2</span>
            </div>
          )}
          {appointment.notes && (
            <div className="pt-3 border-t mt-2">
              <p className="text-gray-500 mb-1">Your Notes</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor's Feedback Card */}
      {appointment.doctor_feedback && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>👨‍⚕️</span> Doctor's Feedback
          </h3>
          <p className="text-gray-700">{appointment.doctor_feedback}</p>
          {appointment.prescription && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-1">📋 Prescription</p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{appointment.prescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Lab Test & Diagnosis Result Card */}
      {appointment.lab_test && result && (
        <div className={`rounded-xl shadow-lg p-6 ${result.mm_positive ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.mm_positive ? (
              <AlertTriangle size={24} className="text-red-600" />
            ) : (
              <CheckCircle size={24} className="text-green-600" />
            )}
            <h3 className="font-semibold text-lg">Diagnosis Result</h3>
          </div>
          
          <div className={`text-xl font-bold mb-3 ${result.mm_positive ? 'text-red-700' : 'text-green-700'}`}>
            {result.mm_positive ? '⚠️ MM Positive - Myeloma Detected' : '✅ MM Negative - No Myeloma Detected'}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{result.plasma_cells}</div>
              <div className="text-xs text-gray-500">Plasma Cells</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{result.non_plasma_cells}</div>
              <div className="text-xs text-gray-500">Non-Plasma Cells</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{(result.plasma_ratio * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Plasma Ratio</div>
            </div>
          </div>
          
          {result.notes && (
            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{result.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}