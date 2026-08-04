import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labAPI } from '../../api'
import { format } from 'date-fns'
import { ArrowLeft, Upload, Play, CheckCircle, AlertTriangle, Image, X, FileImage, FolderOpen, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LabTestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [runningDiagnosis, setRunningDiagnosis] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [diagnosisResult, setDiagnosisResult] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  useEffect(() => {
    fetchTestDetails()
  }, [id])

  const fetchTestDetails = async () => {
    try {
      const res = await labAPI.getTestDetails(id)
      console.log('Test details:', res.data)
      setTest(res.data)
      if (res.data.result) {
        setDiagnosisResult(res.data.result)
      }
    } catch (err) {
      console.error('Error fetching test:', err)
      toast.error('Failed to load test details')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast.error('Please select image files (JPG, PNG, JPEG)')
      return
    }
    setSelectedFiles(imageFiles)
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
    toast.success(`${imageFiles.length} image(s) selected`)
  }

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files)
    // Filter only image files from folder
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast.error('No image files found in the selected folder')
      return
    }
    setSelectedFiles(imageFiles)
    const newPreviews = imageFiles.slice(0, 12).map(file => URL.createObjectURL(file)) // Show first 12 previews
    setPreviews(newPreviews)
    toast.success(`${imageFiles.length} image(s) loaded from folder`)
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select images or a folder first')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await labAPI.uploadImages(id, formData)
      toast.success(`${selectedFiles.length} image(s) uploaded successfully`)
      setSelectedFiles([])
      setPreviews([])
      setUploadProgress(100)
      fetchTestDetails()
    } catch (err) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRunDiagnosis = async () => {
    setRunningDiagnosis(true)
    toast.loading('Running AI diagnosis on uploaded images...', { id: 'diagnosis' })
    try {
      const result = await labAPI.runDiagnosis(id)
      setDiagnosisResult(result.data)
      toast.success('AI Diagnosis completed!', { id: 'diagnosis' })
      fetchTestDetails()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to run diagnosis', { id: 'diagnosis' })
    } finally {
      setRunningDiagnosis(false)
    }
  }

  const markAsCompleted = async () => {
    if (!confirm('Mark this test as completed? The results will be shared with the doctor.')) return
    try {
      await labAPI.markCompleted(id)
      toast.success('Test marked as completed!')
      fetchTestDetails()
    } catch (err) {
      toast.error('Failed to mark as completed')
    }
  }

  // NEW: Cancel Test Function
  const handleCancelTest = async () => {
    if (!confirm('Are you sure you want to cancel this lab test? The patient will be notified. This action cannot be undone.')) return
    
    try {
      const response = await labAPI.cancelTest(id)
      toast.success(response.data.message || 'Test cancelled successfully')
      fetchTestDetails() // Refresh the page
    } catch (err) {
      console.error('Cancel error:', err)
      toast.error(err.response?.data?.detail || 'Failed to cancel test')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!test) return null

  const canUpload = test.status === 'ordered' || test.status === 'scheduled'
  const canRunDiagnosis = test.status === 'images_uploaded' && !test.has_result
  const hasResult = test.has_result || diagnosisResult
  const isCompleted = test.status === 'completed'
  const isCancelled = test.status === 'cancelled'
  
  // Check if test date has passed
  const isTestDatePassed = test.scheduled_date && new Date(test.scheduled_date) < new Date()
  const isTestInFuture = test.scheduled_date && new Date(test.scheduled_date) > new Date()

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Test Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Information</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Patient Name</p>
            <p className="font-medium">{test.patient_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Test Type</p>
            <p className="font-medium">{test.test_type || 'Bone Marrow Biopsy'}</p>
          </div>
          {test.scheduled_date && (
            <div>
              <p className="text-gray-500">Scheduled Date</p>
              <p className="font-medium">{format(new Date(test.scheduled_date), 'PPP p')}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              test.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
              test.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              test.status === 'images_uploaded' ? 'bg-purple-100 text-purple-800' :
              test.status === 'completed' ? 'bg-green-100 text-green-800' :
              test.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {test.status}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Button - Only show if test date has passed */}
      {(test.status === 'ordered' || test.status === 'scheduled') && isTestDatePassed && (
        <div className="mb-6">
          <button
            onClick={handleCancelTest}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle size={18} /> Cancel Lab Test (Patient did not show up)
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            This will cancel the test and notify the doctor. The test record will remain in the system with status "cancelled".
          </p>
        </div>
      )}

      {/* Info message for future tests */}
      {(test.status === 'ordered' || test.status === 'scheduled') && isTestInFuture && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <p className="text-sm text-blue-700">
              This test is scheduled for {format(new Date(test.scheduled_date), 'PPP')}. 
              Cancel option will appear after the test date if the patient does not show up.
            </p>
          </div>
        </div>
      )}

      {/* Cancelled Test Message */}
      {isCancelled && (
        <div className="bg-red-100 rounded-xl shadow-lg p-6 mb-6 text-center border-2 border-red-300">
          <XCircle size={48} className="mx-auto text-red-600 mb-2" />
          <p className="text-red-800 font-medium text-lg">Test Cancelled</p>
          <p className="text-sm text-red-600 mt-1">This lab test has been cancelled. The doctor has been notified.</p>
        </div>
      )}

      {/* Upload Images Section - SUPPORTS FOLDER UPLOAD */}
      {!isCompleted && !isCancelled && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image size={18} className="text-blue-600" /> Upload Bone Marrow Images
          </h3>
          
          {canUpload && (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Single File Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Select Images</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, JPEG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Folder Upload */}
                <div 
                  onClick={() => folderInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50"
                >
                  <FolderOpen size={32} className="mx-auto text-purple-500 mb-2" />
                  <p className="text-gray-600 font-medium">Upload Entire Folder</p>
                  <p className="text-xs text-gray-400 mt-1">Select folder containing patient images</p>
                  <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFolderSelect}
                    className="hidden"
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                  />
                </div>
              </div>

              {/* Selected Files Preview */}
              {previews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{selectedFiles.length} file(s) selected</p>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {selectedFiles.length > 12 && (
                    <p className="text-xs text-gray-500 mt-1">+ {selectedFiles.length - 12} more images</p>
                  )}
                  <button
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Image(s)`}
                  </button>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </>
          )}

          {test.status === 'images_uploaded' && !test.has_result && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">✅ Images uploaded successfully! Ready to run AI diagnosis.</p>
            </div>
          )}
        </div>
      )}

      {/* Run Diagnosis Section */}
      {!isCompleted && !isCancelled && canRunDiagnosis && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Play size={18} className="text-purple-600" /> Run AI Diagnosis with YOLOv8
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            The YOLOv8 model will analyze all uploaded images to detect and count plasma cells,
            then calculate the MM diagnosis based on IMWG criteria (≥10% plasma cells).
          </p>
          <button
            onClick={handleRunDiagnosis}
            disabled={runningDiagnosis}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {runningDiagnosis ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Analyzing {test.images_count || 'images'}...</>
            ) : (
              <><Play size={16} /> Run YOLOv8 AI Diagnosis</>
            )}
          </button>
        </div>
      )}

      {/* Diagnosis Result Section */}
      {hasResult && diagnosisResult && !isCancelled && (
        <div className={`rounded-xl shadow-lg p-6 mb-6 border-2 ${
          diagnosisResult.mm_positive ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {diagnosisResult.mm_positive ? (
              <AlertTriangle size={24} className="text-red-600" />
            ) : (
              <CheckCircle size={24} className="text-green-600" />
            )}
            <h3 className="font-semibold text-lg">YOLOv8 Diagnosis Result</h3>
          </div>
          
          <div className={`text-xl font-bold mb-4 ${diagnosisResult.mm_positive ? 'text-red-700' : 'text-green-700'}`}>
            {diagnosisResult.mm_positive ? '⚠️ MM Positive - Myeloma Detected' : '✅ MM Negative - No Myeloma Detected'}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{diagnosisResult.plasma_cells}</div>
              <div className="text-xs text-gray-500">Plasma Cells Detected</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{diagnosisResult.non_plasma_cells}</div>
              <div className="text-xs text-gray-500">Non-Plasma Cells</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.round(diagnosisResult.plasma_ratio * 100)}%</div>
              <div className="text-xs text-gray-500">Plasma Cell Ratio</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">📊 AI Analysis Summary:</p>
            <p>{diagnosisResult.notes || `Analysis complete. ${diagnosisResult.plasma_cells} plasma cells detected out of ${diagnosisResult.total_cells} total cells. Plasma ratio: ${(diagnosisResult.plasma_ratio * 100).toFixed(1)}%. ${diagnosisResult.mm_positive ? 'Exceeds IMWG threshold (≥10%).' : 'Below IMWG threshold (≥10%).'}`}</p>
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Based on International Myeloma Working Group (IMWG) diagnostic criteria
          </div>
        </div>
      )}

      {/* Mark as Completed Button */}
      {hasResult && !isCompleted && !isCancelled && (
        <button
          onClick={markAsCompleted}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> Mark Test as Completed & Share with Doctor
        </button>
      )}

      {isCompleted && (
        <div className="bg-green-100 rounded-xl shadow-lg p-6 text-center">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-2" />
          <p className="text-green-800 font-medium">Test Completed</p>
          <p className="text-sm text-green-600 mt-1">Results have been shared with the doctor</p>
        </div>
      )}
    </div>
  )
}