import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorsAPI } from '../../api'
import { MapPin, Clock, Building2, Search, Star } from 'lucide-react'

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    doctorsAPI.list()
      .then(res => {
        setDoctors(res.data)
        setFiltered(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(doctors.filter(d => 
      d.full_name?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.hospital_name?.toLowerCase().includes(q)
    ))
  }, [search, doctors])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find a Hematologist</h1>
        <p className="text-gray-500 mt-1">Specialists in multiple myeloma diagnosis and treatment</p>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Search by name, city, or hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading doctors...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No doctors found matching your search.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <div 
              key={doc.id} 
              className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/patient/doctors/${doc.id}`)}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                  {doc.full_name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{doc.full_name}</h3>
                  <p className="text-sm text-blue-600">{doc.specialization || 'Hematologist'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{doc.rating?.toFixed(1) || 'New'} ({doc.total_reviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {doc.hospital_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={14} className="text-gray-400" />
                    {doc.hospital_name}
                  </div>
                )}
                {doc.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    {doc.city}
                  </div>
                )}
                {doc.available_days && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    {doc.available_days} · {doc.available_start}–{doc.available_end}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">
                  {doc.consultation_fee > 0 ? `PKR ${doc.consultation_fee.toLocaleString()}` : 'Fee not listed'}
                </span>
                <button 
  className="btn-primary text-sm px-4 py-1.5" 
  onClick={(e) => { 
    e.stopPropagation(); 
    navigate(`/patient/book/${doc.id}`);
  }}
>
  Book Appointment
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}