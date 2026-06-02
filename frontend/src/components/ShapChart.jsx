import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = {
  positive: '#06b6d4',
  negative: '#ef4444',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const v = payload[0].value
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <div className="text-gray-400">{payload[0].payload.feature}</div>
        <div className={`font-semibold mt-0.5 ${v >= 0 ? 'text-accent-cyan' : 'text-accent-red'}`}>
          Impact: {v >= 0 ? '+' : ''}{v.toFixed(4)}
        </div>
      </div>
    )
  }
  return null
}

export default function ShapChart({ factors = [], title = 'Top SHAP Factors' }) {
  const data = [...factors]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 6)
    .map(f => ({ feature: f.feature, value: parseFloat(f.value?.toFixed(4) ?? 0) }))

  return (
    <div className="glass-card p-4">
      <div className="text-sm font-semibold text-white mb-3">{title}</div>
      {data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
          Run prediction to see factors
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category" dataKey="feature"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false} tickLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.value >= 0 ? COLORS.positive : COLORS.negative} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-sm bg-accent-cyan" /> Increases risk
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-sm bg-accent-red" /> Decreases risk
        </span>
      </div>
    </div>
  )
}
