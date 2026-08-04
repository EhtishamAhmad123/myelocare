import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, Users, FlaskConical, User, LogOut, Activity, FileText, Upload, Settings, ClipboardList } from 'lucide-react'

const navItems = {
  patient: [
    { to: '/patient', label: 'Dashboard', icon: Home },
    { to: '/patient/doctors', label: 'Find Doctors', icon: Users },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/results', label: 'Test Results', icon: FileText },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: Home },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', label: 'Patients', icon: Users },
    { to: '/doctor/profile', label: 'Profile', icon: Settings },
  ],
  labtech: [
    { to: '/labtech', label: 'Dashboard', icon: Home },
    { to: '/labtech/tests', label: 'All Tests', icon: ClipboardList },
    { to: '/labtech/profile', label: 'Profile', icon: User },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const items = navItems[user?.role] || navItems.patient

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FlaskConical size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">MyeloCare</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 capitalize">{user?.role} Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}