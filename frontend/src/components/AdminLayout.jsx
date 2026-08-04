import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Users, Stethoscope, Microscope, LogOut, Home } from 'lucide-react'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/admin/patients', label: 'Patients', icon: Users },
    { path: '/admin/labtechs', label: 'Lab Techs', icon: Microscope },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2"><Shield size={24} /><span className="font-bold text-lg">MyeloCare Admin</span></div>
          <p className="text-xs text-gray-400 mt-2">{user?.full_name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><div className="p-6"><Outlet /></div></main>
    </div>
  )
}