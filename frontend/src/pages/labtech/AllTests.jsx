import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { labAPI } from '../../api'
import { format } from 'date-fns'
import { FlaskConical, Clock, CheckCircle, Upload, Eye, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LabTechAllTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await labAPI.myPending()
      setTests(res.data)
    } catch (err) {
      console.error('Error fetching tests:', err)
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      ordered: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      images_uploaded: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={16} className="text-green-600" />
    if (status === 'images_uploaded') return <Upload size={16} className="text-purple-600" />
    return <Clock size={16} className="text-yellow-600" />
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
        <h1 className="text-2xl font-bold text-gray-900">All Lab Tests</h1>
        <p className="text-gray-500 mt-1">Manage and process bone marrow biopsy tests</p>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FlaskConical size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tests assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">Tests will appear here when doctors order them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              onClick={() => navigate(`/labtech/tests/${test.id}`)}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{test.patient_name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Test: {test.test_type || 'Bone Marrow Biopsy'}</p>
                  <p className="text-xs text-gray-400">Lab: {test.lab_name}</p>
                  {test.scheduled_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Scheduled: {format(new Date(test.scheduled_date), 'PPp')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    {getStatusIcon(test.status)}
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}