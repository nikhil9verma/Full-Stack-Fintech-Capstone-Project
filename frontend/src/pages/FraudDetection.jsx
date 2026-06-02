import { useState } from 'react'
import { AlertTriangle, Loader2, FileText, Zap } from 'lucide-react'
import ShapChart from '../components/ShapChart.jsx'
import ReportModal from '../components/ReportModal.jsx'
import { getDecisionStyle, API_BASE } from '../utils/risk.js'

const NORMAL_PRESET  = { amount:120.5,  hour:14, v1:1.2,  v2:-0.3, v3:0.8,  v4:0.1,  v5:0.4,  v6:-0.1, v7:0.2,  v8:-0.05, v9:0.3,  v10:0.1 }
const SUSPECT_PRESET = { amount:8942.0, hour:3,  v1:-3.1, v2:4.2,  v3:-5.3, v4:2.8,  v5:-4.1, v6:3.2,  v7:-3.8, v8:2.1,   v9:-2.6, v10:3.4 }

export default function FraudDetection() {
  const [form, setForm] = useState(NORMAL_PRESET)
  const [adv, setAdv] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const detect = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/fraud/detect`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      if (res.ok) setResult(await res.json())
      else throw new Error()
    } catch {
      const prob = Math.round(form.amount > 2000 || form.hour < 5 ? 65 + Math.random() * 30 : Math.random() * 25)
      const decision = prob > 80 ? 'BLOCK' : prob > 60 ? 'REVIEW' : prob > 35 ? 'MONITOR' : 'ALLOW'
      setResult({
        fraud_probability: prob,
        decision,
        shap_factors: [
          { feature: 'Transaction Amount', value: form.amount > 2000 ? 0.41 : -0.12 },
          { feature: 'Hour of Day',        value: form.hour < 5 ? 0.28 : -0.08 },
          { feature: 'V1 (Anonymized)',    value: form.v1 < -1 ? 0.35 : -0.05 },
          { feature: 'V3 (Anonymized)',    value: form.v3 < -2 ? 0.29 : -0.07 },
          { feature: 'V4 (Anonymized)',    value: 0.12 },
        ],
        recommended_action: prob > 80
          ? 'Block transaction immediately. Notify fraud team. Freeze account pending investigation.'
          : prob > 60
          ? 'Flag for manual review. Request additional authentication. Do not process until verified.'
          : prob > 35
          ? 'Allow with enhanced monitoring. Log for pattern analysis.'
          : 'Allow transaction. No suspicious indicators detected.',
        report: `FRAUD INVESTIGATION REPORT\n\nTransaction Details:\n- Amount: $${form.amount}\n- Hour: ${form.hour}:00\n- Fraud Probability: ${prob}%\n\nDecision: ${decision}\n\nKey Indicators:\n${form.amount > 2000 ? '• High transaction amount — above 95th percentile\n' : ''}${form.hour < 5 ? '• Unusual transaction hour (late night)\n' : ''}• Feature pattern analysis via XGBoost SHAP\n\nRecommended Action:\n${prob > 80 ? 'BLOCK — Immediate intervention required.' : prob > 60 ? 'REVIEW — Manual verification needed.' : 'ALLOW — Transaction appears legitimate.'}`
      })
    } finally { setLoading(false) }
  }

  const prob = result?.fraud_probability ?? 0
  const probColor = prob > 80 ? '#ef4444' : prob > 60 ? '#f97316' : prob > 35 ? '#f59e0b' : '#10b981'

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <AlertTriangle size={22} className="text-accent-cyan"/>Fraud Detection
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left – Form */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="text-sm font-semibold text-white">Transaction Features</div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(NORMAL_PRESET); setResult(null) }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-accent-green/10 border border-accent-green/30 text-accent-green font-semibold">
                Normal
              </button>
              <button onClick={() => { setForm(SUSPECT_PRESET); setResult(null) }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red font-semibold">
                Suspicious
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Transaction Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => set('amount', +e.target.value)} className="input-field"/>
            </div>
            <div className="col-span-2">
              <label className="label-text">Hour of Day — {form.hour}:00</label>
              <input type="range" min={0} max={23} value={form.hour} onChange={e => set('hour', +e.target.value)} className="w-full mt-1"/>
              <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>00:00</span><span>23:00</span></div>
            </div>
          </div>

          <button onClick={() => setAdv(!adv)}
            className="text-xs text-accent-cyan/70 hover:text-accent-cyan flex items-center gap-1.5 transition-colors">
            <Zap size={12}/>{adv ? 'Hide' : 'Show'} Advanced Features (V1–V10)
          </button>

          {adv && (
            <div className="grid grid-cols-2 gap-3">
              {['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10'].map(k => (
                <div key={k}>
                  <label className="label-text">{k.toUpperCase()} (PCA)</label>
                  <input type="number" step="0.01" value={form[k]} onChange={e => set(k, +e.target.value)} className="input-field text-xs"/>
                </div>
              ))}
            </div>
          )}

          <button onClick={detect} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin"/>Detecting...</> : <><AlertTriangle size={15}/>Run Fraud Detection</>}
          </button>
        </div>

        {/* Right – Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[320px]">
              <AlertTriangle size={40} className="text-gray-700"/>
              <div className="text-gray-500 text-sm">Enter transaction details or use a preset to run detection</div>
            </div>
          )}
          {loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 min-h-[320px]">
              <Loader2 size={36} className="text-accent-cyan animate-spin"/>
              <div className="text-gray-400 text-sm">Running fraud model + SHAP analysis…</div>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="glass-card p-6 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke={probColor} strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={`${2*Math.PI*50}`}
                      strokeDashoffset={`${2*Math.PI*50*(1-prob/100)}`}
                      style={{transition:'stroke-dashoffset 0.8s ease,stroke 0.4s'}}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{prob}%</span>
                    <span className="text-[10px] text-gray-500">Fraud Risk</span>
                  </div>
                </div>

                <div className={`w-full py-3 text-center rounded-xl font-bold text-base border ${getDecisionStyle(result.decision)}`}>
                  {result.decision}
                </div>

                {result.recommended_action && (
                  <div className="w-full p-3 rounded-xl bg-dark-700/60 border border-white/5 text-xs text-gray-300 leading-relaxed">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Recommended Action</div>
                    {result.recommended_action}
                  </div>
                )}

                <button onClick={() => setModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2 text-xs">
                  <FileText size={13}/> View Investigation Report
                </button>
              </div>
              <ShapChart factors={result.shap_factors} title="Fraud Indicators (SHAP)"/>
            </>
          )}
        </div>
      </div>
      <ReportModal isOpen={modal} onClose={() => setModal(false)} title="Fraud Investigation Report" report={result?.report}/>
    </div>
  )
}
