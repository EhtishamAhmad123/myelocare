import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentsAPI } from '../../api'
import { format } from 'date-fns'
import { FlaskConical, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'

export default function TestResults() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.mine()
      // Filter only appointments that have lab test results
      const withResults = res.data.filter(a => a.has_lab_test)
      setAppointments(withResults)
    } catch (err) {
      console.error('Error fetching test results:', err)
    } finally {
      setLoading(false)
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lab Test Results</h1>
        <p className="text-gray-500 mt-1">View your multiple myeloma diagnosis results</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <FlaskConical size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No test results available yet</p>
          <p className="text-sm text-gray-400 mt-1">Test results will appear here after your lab test is completed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => navigate(`/patient/appointments/${apt.id}`)}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${apt.has_lab_test ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <FlaskConical size={24} className={apt.has_lab_test ? 'text-purple-600' : 'text-gray-400'} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{apt.doctor_name || 'Doctor'}</h3>
                      <p className="text-sm text-gray-500">{apt.hospital}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM dd, yyyy') : 'Date TBD'}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}