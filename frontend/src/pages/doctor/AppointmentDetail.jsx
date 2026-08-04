import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { appointmentsAPI, labAPI } from '../../api'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, User, FileText, FlaskConical, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorAppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showLabTest, setShowLabTest] = useState(false)
  const [feedback, setFeedback] = useState({ doctor_feedback: '', prescription: '' })
  const [laboratories, setLaboratories] = useState([])
  const [labTest, setLabTest] = useState({
    lab_name: '',
    lab_address: '',
    scheduled_date: '',
    test_type: 'Bone Marrow Biopsy'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAppointment()
    fetchLaboratories()
  }, [id])

  const fetchAppointment = async () => {
    try {
      const res = await appointmentsAPI.get(id)
      setAppointment(res.data)
    } catch (err) {
      console.error('Error fetching appointment:', err)
      toast.error('Failed to load appointment')
    } finally {
      setLoading(false)
    }
  }

  const fetchLaboratories = async () => {
    try {
      const res = await labAPI.listLabtechs()
      console.log('Fetched laboratories:', res.data)
      setLaboratories(res.data || [])
    } catch (err) {
      console.error('Error fetching labs:', err)
      setLaboratories([])
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.doctor_feedback) {
      toast.error('Please provide clinical notes')
      return
    }
    setSubmitting(true)
    try {
      await appointmentsAPI.giveFeedback({
        appointment_id: parseInt(id),
        doctor_feedback: feedback.doctor_feedback,
        prescription: feedback.prescription
      })
      toast.success('Feedback saved successfully')
      setShowFeedback(false)
      fetchAppointment()
    } catch (err) {
      toast.error('Failed to save feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOrderLabTest = async () => {
    if (!labTest.lab_name || !labTest.scheduled_date) {
      toast.error('Please select lab and date')
      return
    }
    setSubmitting(true)
    try {
      await labAPI.orderTest({
        appointment_id: parseInt(id),
        scheduled_date: new Date(labTest.scheduled_date).toISOString(),
        lab_name: labTest.lab_name,
        lab_address: labTest.lab_address,
        test_type: labTest.test_type
      })
      toast.success('Lab test ordered successfully')
      setShowLabTest(false)
      fetchAppointment()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to order test')
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

  if (!appointment) return null

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-medium">{appointment.patient?.name || 'Patient'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Appointment Date & Time</p>
            <p className="font-medium">
              {appointment.appointment_date ? format(new Date(appointment.appointment_date), 'PPP p') : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {appointment.status || 'pending'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Patient Notes</p>
            <p className="text-sm">{appointment.notes || 'No notes provided'}</p>
          </div>
        </div>
      </div>

      {/* Doctor Feedback Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} /> Clinical Notes & Feedback
          </h3>
          {!showFeedback && !appointment.doctor_feedback && (
            <button onClick={() => setShowFeedback(true)} className="btn-primary text-sm">
              Add Feedback
            </button>
          )}
        </div>

        {appointment.doctor_feedback && !showFeedback && (
          <div>
            <p className="text-gray-700 whitespace-pre-wrap mb-3">{appointment.doctor_feedback}</p>
            {appointment.prescription && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-1">Prescription</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{appointment.prescription}</p>
              </div>
            )}
          </div>
        )}

        {showFeedback && (
          <div className="space-y-4">
            <textarea
              className="input w-full"
              rows={4}
              placeholder="Clinical notes, diagnosis, recommendations..."
              value={feedback.doctor_feedback}
              onChange={(e) => setFeedback({ ...feedback, doctor_feedback: e.target.value })}
            />
            <textarea
              className="input w-full"
              rows={3}
              placeholder="Prescription (medications, dosage, instructions)..."
              value={feedback.prescription}
              onChange={(e) => setFeedback({ ...feedback, prescription: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={handleSubmitFeedback} disabled={submitting} className="btn-primary flex items-center gap-2">
                <Send size={16} /> {submitting ? 'Saving...' : 'Save Feedback'}
              </button>
              <button onClick={() => setShowFeedback(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Lab Test Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical size={18} /> Order Lab Test
          </h3>
          {!showLabTest && !appointment.has_lab_test && (
            <button onClick={() => setShowLabTest(true)} className="btn-primary text-sm">
              Order Test
            </button>
          )}
        </div>

        {appointment.has_lab_test && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">✅ Lab test has been ordered. Results will be available soon.</p>
          </div>
        )}

        {showLabTest && (
          <div className="space-y-4">
            <div>
              <label className="label">Select Laboratory</label>
              <select
                className="input w-full"
                value={labTest.lab_name}
                onChange={(e) => {
                  const selected = laboratories.find(l => l.name === e.target.value)
                  setLabTest({
                    ...labTest,
                    lab_name: e.target.value,
                    lab_address: selected?.address || ''
                  })
                }}
              >
                <option value="">-- Select Laboratory --</option>
                {laboratories.map((lab) => (
                  <option key={lab.id} value={lab.name}>{lab.name} - {lab.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Test Type</label>
              <input
                type="text"
                className="input"
                value={labTest.test_type}
                onChange={(e) => setLabTest({ ...labTest, test_type: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                className="input"
                value={labTest.scheduled_date}
                onChange={(e) => setLabTest({ ...labTest, scheduled_date: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleOrderLabTest} disabled={submitting} className="btn-primary">
                {submitting ? 'Ordering...' : 'Confirm Lab Test'}
              </button>
              <button onClick={() => setShowLabTest(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}