import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShieldCheck,
  UserMinus, Users, BookOpen, Activity
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/credit',    icon: ShieldCheck,     label: 'Credit Assessment' },
  { to: '/churn',     icon: UserMinus,       label: 'Churn Prediction' },
  { to: '/leads',     icon: Users,           label: 'Lead Scoring' },
  { to: '/compliance',icon: BookOpen,        label: 'Compliance Q&A' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-dark-900 border-r border-white/[0.06] flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center shadow-glow-sm">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">FinSight AI</div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Intelligence Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
             ${isActive
               ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-glow-sm'
               : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`
          }>
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="glass-card p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-medium">System Status</div>
          {['ML Models', 'LLM (Groq)', 'Vector DB'].map(s => (
            <div key={s} className="flex items-center justify-between py-0.5">
              <span className="text-xs text-gray-400">{s}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-accent-green font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
                Online
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
