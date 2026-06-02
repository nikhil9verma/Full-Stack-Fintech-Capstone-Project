import { getRiskBg } from '../utils/risk.js'

export default function RiskBadge({ tier, size = 'sm' }) {
  const sizeClass = size === 'lg'
    ? 'px-4 py-1.5 text-sm font-bold tracking-wider'
    : size === 'md'
    ? 'px-3 py-1 text-xs font-bold tracking-wider'
    : 'px-2.5 py-0.5 text-[10px] font-bold tracking-widest'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border uppercase ${sizeClass} ${getRiskBg(tier)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {tier}
    </span>
  )
}
