import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorsAPI, appointmentsAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Calendar, Clock, MapPin, Building2, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react'
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from 'date-fns'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }

    // Fetch doctor details
    doctorsAPI.get(doctorId)
      .then(res => setDoctor(res.data))
      .catch(err => {
        console.error('Error fetching doctor:', err)
        toast.error('Doctor not found')
        navigate('/patient/doctors')
      })
      .finally(() => setLoading(false))
  }, [doctorId, user, navigate])

  // Generate available time slots (9 AM to 5 PM, 30-min intervals)
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

  // Generate next 14 days for date selection
  const generateDateOptions = () => {
    const dates = []
    const today = startOfDay(new Date())
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }

  const timeSlots = generateTimeSlots()
  const dateOptions = generateDateOptions()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }

    setSubmitting(true)
    try {
      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      await appointmentsAPI.book({
        doctor_id: parseInt(doctorId),
        appointment_date: appointmentDateTime.toISOString(),
        notes: symptoms
      })
      
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (err) {
      console.error('Booking error:', err)
      toast.error(err.response?.data?.detail || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!doctor) return null

  const timeSlotsForSelectedDate = timeSlots

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft size={20} />
        Back to Doctors
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Doctor Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  {doctor.full_name?.charAt(0) || 'D'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{doctor.full_name}</h2>
              <p className="text-blue-600 text-sm">{doctor.specialization}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Building2 size={16} />
                <span>{doctor.hospital_name || 'Private Practice'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={16} />
                <span>{doctor.city || 'Lahore'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={16} />
                <span>{doctor.available_days || 'Mon - Sat'} · {doctor.available_start || '09:00'} - {doctor.available_end || '17:00'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <CreditCard size={16} />
                <span className="font-semibold text-gray-900">
                  PKR {doctor.consultation_fee?.toLocaleString() || '2,500'} consultation fee
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                ⚕️ {doctor.total_reviews || 0}+ patients • {doctor.rating || 4.5}★ rating
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h2>
            <p className="text-gray-500 mb-6">Please fill in the details below to schedule your consultation</p>

            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s ? <CheckCircle size={16} /> : s}
                  </div>
                  {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Date */}
              <div className={`${step === 1 ? 'block' : 'hidden'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Select Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
                  {dateOptions.map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(format(date, 'yyyy-MM-dd'))
                        setStep(2)
                      }}
                      className={`p-3 text-center rounded-lg border transition-all ${
                        selectedDate === format(date, 'yyyy-MM-dd')
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-semibold">{format(date, 'EEE')}</div>
                      <div className="text-sm">{format(date, 'MMM dd')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Time */}
              <div className={`${step === 2 ? 'block' : 'hidden'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                  {timeSlotsForSelectedDate.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSelectedTime(time)
                        setStep(3)
                      }}
                      className={`p-2 text-center rounded-lg border transition-all ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Symptoms & Confirmation */}
              <div className={`${step === 3 ? 'block' : 'hidden'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms (optional)
                </label>
                <textarea
                  rows={4}
                  className="input w-full mb-6"
                  placeholder="Please describe your symptoms, concerns, or any specific questions for the doctor..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />

                {/* Appointment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Doctor:</span> {doctor.full_name}</p>
                    <p><span className="text-gray-500">Date:</span> {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}</p>
                    <p><span className="text-gray-500">Time:</span> {selectedTime}</p>
                    <p><span className="text-gray-500">Fee:</span> PKR {doctor.consultation_fee?.toLocaleString() || '2,500'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !selectedDate) {
                        toast.error('Please select a date')
                        return
                      }
                      if (step === 2 && !selectedTime) {
                        toast.error('Please select a time')
                        return
                      }
                      setStep(step + 1)
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto disabled:opacity-50"
                  >
                    {submitting ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}