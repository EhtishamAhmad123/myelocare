import { useNavigate } from 'react-router-dom'
import { FlaskConical, Shield, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FlaskConical size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-800">MyeloCare</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</button>
          <button onClick={() => navigate('/register')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Zap size={14} /> Federated AI · Privacy-Preserving
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
          Multiple Myeloma Diagnosis,<br />
          <span className="text-blue-600">Powered by Federated Learning</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          MyeloCare connects patients, hematologists, and lab technicians in a secure, 
          AI-assisted workflow for early MM detection using YOLOv8-based plasma cell analysis.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Book an Appointment
          </button>
          <button onClick={() => navigate('/login')} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Sign In to Portal
          </button>
        </div>
      </div>

      {/* Lab Technician Registration Link */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-gray-600 mb-2">🔬 Medical Laboratory Technologist</p>
          <p className="text-sm text-gray-500 mb-3">AHPC registered professionals can join our network</p>
          <button 
            onClick={() => navigate('/register-labtech')}
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            Register with AHPC verification →
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Privacy-Preserving FL', desc: 'Federated learning ensures no raw patient data leaves your institution. Only encrypted model weights are shared.', color: 'bg-blue-50 text-blue-600' },
            { icon: Zap, title: 'Real-Time AI Diagnosis', desc: 'Upload bone marrow slide images and get plasma cell counts with MM positive/negative classification in seconds.', color: 'bg-green-50 text-green-600' },
            { icon: Users, title: 'End-to-End Workflow', desc: 'From appointment booking to lab test ordering to result delivery — everything in one platform.', color: 'bg-purple-50 text-purple-600' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-gray-100">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Book Appointment', desc: 'Find a hematologist and book a consultation' },
              { step: '2', title: 'Consultation', desc: 'Doctor examines and orders a bone marrow test' },
              { step: '3', title: 'Lab Test', desc: 'Lab tech uploads microscopy images' },
              { step: '4', title: 'AI Diagnosis', desc: 'Get instant MM detection results' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}