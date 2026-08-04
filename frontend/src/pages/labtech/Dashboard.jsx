import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { labAPI } from '../../api'
import { Calendar, Clock, CheckCircle, FlaskConical, AlertCircle, ChevronRight, Upload, FileImage, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function LabTechDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

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

  const pendingTests = tests.filter(t => t.status === 'ordered' || t.status === 'scheduled')
  const inProgressTests = tests.filter(t => t.status === 'images_uploaded')
  const completedTests = tests.filter(t => t.has_result === true || t.status === 'completed')
  const cancelledTests = tests.filter(t => t.status === 'cancelled')

  // Navigation handlers for clickable stats
  const goToPendingTests = () => {
    navigate('/labtech/tests')
  }

  const goToInProgressTests = () => {
    navigate('/labtech/tests')
  }

  const goToCompletedTests = () => {
    navigate('/labtech/tests')
  }

  const goToAllTests = () => {
    navigate('/labtech/tests')
  }

  const goToCancelledTests = () => {
    navigate('/labtech/tests')
  }

  const getStatusBadge = (status) => {
    const styles = {
      ordered: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      images_uploaded: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name} 🔬</h1>
        <p className="text-gray-500 mt-1">Manage bone marrow biopsy tests and AI diagnostics</p>
      </div>

      {/* Stats Cards - CLICKABLE like Patient/Doctor dashboards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {/* Pending Tests Card - Clickable */}
        <div 
          onClick={goToPendingTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingTests.length}</p>
              <p className="text-sm text-gray-500">Pending Tests</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* In Progress Card - Clickable */}
        <div 
          onClick={goToInProgressTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressTests.length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Completed Card - Clickable */}
        <div 
          onClick={goToCompletedTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedTests.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Cancelled Card - Clickable */}
        <div 
          onClick={goToCancelledTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{cancelledTests.length}</p>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Tests Card - Clickable */}
        <div 
          onClick={goToAllTests}
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              <p className="text-sm text-gray-500">Total Tests</p>
              <p className="text-xs text-gray-400 mt-1">Click to view all</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FlaskConical size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {/* Pending Tests Section */}
        {pendingTests.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-yellow-600" /> Pending Tests
              </h2>
              <button 
                onClick={() => navigate('/labtech/tests')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {pendingTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/labtech/tests/${test.id}`)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Tests Section */}
        {inProgressTests.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Upload size={18} className="text-purple-600" /> In Progress (Images Uploaded)
              </h2>
              <button 
                onClick={() => navigate('/labtech/tests')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {inProgressTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/labtech/tests/${test.id}`)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{test.patient_name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                          Ready for Diagnosis
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Images uploaded - Ready to run AI diagnosis</p>
                      {test.scheduled_date && (
                        <p className="text-xs text-gray-400 mt-1">
                          Scheduled: {format(new Date(test.scheduled_date), 'PPp')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <FileImage size={18} className="text-purple-500" />
                      <ChevronRight size={20} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tests Section */}
        {completedTests.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" /> Recent Completed Tests
              </h2>
              <button 
                onClick={() => navigate('/labtech/tests')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {completedTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/labtech/tests/${test.id}`)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{test.patient_name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Diagnosis: {test.mm_positive ? '⚠️ MM Positive' : '✅ MM Negative'}
                      </p>
                      {test.scheduled_date && (
                        <p className="text-xs text-gray-400 mt-1">
                          Completed: {format(new Date(test.scheduled_date), 'PP')}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Tests Section */}
        {cancelledTests.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <XCircle size={18} className="text-red-600" /> Cancelled Tests
              </h2>
              <button 
                onClick={() => navigate('/labtech/tests')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {cancelledTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/labtech/tests/${test.id}`)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{test.patient_name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          Cancelled
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
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {!loading && tests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FlaskConical size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No tests assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">Tests will appear here when doctors order them</p>
          </div>
        )}
      </div>
    </div>
  )
}