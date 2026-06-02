import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'cyan', className = '' }) {
  const colorMap = {
    cyan:   { icon: 'text-accent-cyan',   glow: 'shadow-glow-sm', border: 'border-accent-cyan/20',   bg: 'bg-accent-cyan/10'   },
    green:  { icon: 'text-accent-green',  glow: '',               border: 'border-accent-green/20',  bg: 'bg-accent-green/10'  },
    yellow: { icon: 'text-accent-yellow', glow: '',               border: 'border-accent-yellow/20', bg: 'bg-accent-yellow/10' },
    orange: { icon: 'text-accent-orange', glow: '',               border: 'border-accent-orange/20', bg: 'bg-accent-orange/10' },
    red:    { icon: 'text-accent-red',    glow: '',               border: 'border-accent-red/20',    bg: 'bg-accent-red/10'    },
    blue:   { icon: 'text-accent-blue',   glow: '',               border: 'border-accent-blue/20',   bg: 'bg-accent-blue/10'   },
  }
  const c = colorMap[color] || colorMap.cyan

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-accent-green' : trend === 'down' ? 'text-accent-red' : 'text-gray-500'

  return (
    <div className={`glass-card p-5 flex flex-col gap-3 hover:border-white/10 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon size={17} className={c.icon} />}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-xs text-gray-400 mt-0.5 font-medium">{title}</div>
        {subtitle && <div className="text-[11px] text-gray-600 mt-1">{subtitle}</div>}
      </div>
    </div>
  )
}
