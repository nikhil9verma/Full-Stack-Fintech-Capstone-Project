/* ─── Shared risk utilities used across all pages ─────────────────── */

export function getRiskColor(tier) {
  const t = tier?.toUpperCase()
  if (t === 'LOW')       return 'text-accent-green'
  if (t === 'MEDIUM')    return 'text-accent-yellow'
  if (t === 'HIGH')      return 'text-accent-orange'
  if (t === 'VERY HIGH' || t === 'CRITICAL') return 'text-accent-red'
  return 'text-gray-400'
}

export function getRiskBg(tier) {
  const t = tier?.toUpperCase()
  if (t === 'LOW')       return 'bg-accent-green/10 border-accent-green/30 text-accent-green'
  if (t === 'MEDIUM')    return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'
  if (t === 'HIGH')      return 'bg-accent-orange/10 border-accent-orange/30 text-accent-orange'
  if (t === 'VERY HIGH' || t === 'CRITICAL') return 'bg-accent-red/10 border-accent-red/30 text-accent-red'
  return 'bg-gray-500/10 border-gray-500/30 text-gray-400'
}

export function getDecisionStyle(decision) {
  const d = decision?.toUpperCase()
  if (d === 'AUTO APPROVE' || d === 'ALLOW')   return 'bg-accent-green/15 border-accent-green/40 text-accent-green'
  if (d === 'REVIEW' || d === 'MONITOR')       return 'bg-accent-yellow/15 border-accent-yellow/40 text-accent-yellow'
  if (d === 'CONDITIONAL' || d === 'FLAG')     return 'bg-accent-orange/15 border-accent-orange/40 text-accent-orange'
  if (d === 'REJECT' || d === 'BLOCK')         return 'bg-accent-red/15 border-accent-red/40 text-accent-red'
  return 'bg-gray-500/15 border-gray-500/40 text-gray-400'
}

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
