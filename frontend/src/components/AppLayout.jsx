import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mic, Code2, MessageSquareText, Calculator, LogOut, Rocket,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/coding-practice', label: 'Coding Practice', icon: Code2 },
  { to: '/behavioral', label: 'Behavioral', icon: MessageSquareText },
  { to: '/aptitude', label: 'Aptitude Test', icon: Calculator },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-paper font-body">
      <aside className="w-64 bg-ink text-white flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 py-6">
          <Rocket className="text-signal" size={22} />
          <span className="font-display font-bold text-lg tracking-tight">PrepPilot</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-signal text-white'
                    : 'text-slate-200 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.target_role || 'No target role set'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
