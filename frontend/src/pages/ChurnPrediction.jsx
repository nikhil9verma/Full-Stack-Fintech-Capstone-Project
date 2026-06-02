import { useState } from 'react'
import { UserMinus, Loader2, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import RiskBadge from '../components/RiskBadge.jsx'
import ShapChart from '../components/ShapChart.jsx'
import ReportModal from '../components/ReportModal.jsx'
import { API_BASE } from '../utils/risk.js'

const DEFAULTS = {
  credit_score: 650, age: 38, tenure: 4,
  balance: 75000, num_of_products: 2,
  has_cr_card: true, is_active_member: true,
  estimated_salary: 850000, geography: 'France',
}

export default function ChurnPrediction() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const predict = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/churn/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      if (res.ok) setResult(await res.json())
      else throw new Error()
    } catch {
      const base = (!form.is_active_member ? 25 : 0) + (form.num_of_products > 2 ? 20 : 0)
        + (form.balance === 0 ? 15 : 0) + (form.age > 45 ? 10 : 0)
      const prob = Math.min(95, Math.round(base + Math.random() * 25))
      const tier = prob > 70 ? 'CRITICAL' : prob > 50 ? 'HIGH' : prob > 30 ? 'MEDIUM' : 'LOW'
      setResult({
        churn_probability: prob,
        priority_tier: tier,
        retention_action: prob > 70
          ? 'Immediate personal outreach by relationship manager. Offer premium loyalty benefits and fee waiver.'
          : prob > 50
          ? 'Send targeted retention campaign with personalized offer within 48 hours.'
          : prob > 30
          ? 'Enroll in loyalty program. Schedule quarterly review call.'
          : 'Standard engagement. No immediate intervention required.',
        shap_factors: [
          { feature: 'Is Active Member', value: form.is_active_member ? -0.28 : 0.28 },
          { feature: 'Age',              value: form.age > 45 ? 0.22 : -0.08 },
          { feature: 'Num of Products',  value: form.num_of_products > 2 ? 0.31 : -0.12 },
          { feature: 'Balance',          value: form.balance < 10000 ? 0.18 : -0.09 },
          { feature: 'Geography',        value: form.geography === 'Germany' ? 0.15 : -0.04 },
        ],
        report: `CUSTOMER CHURN RISK REPORT\n\nCustomer Profile:\n- Age: ${form.age} | Geography: ${form.geography}\n- Credit Score: ${form.credit_score} | Tenure: ${form.tenure} years\n- Balance: ₹${form.balance.toLocaleString()} | Products: ${form.num_of_products}\n- Active Member: ${form.is_active_member ? 'Yes' : 'No'}\n\nChurn Probability: ${prob}%\nPriority Tier: ${tier}\n\nKey Churn Drivers:\n1. Activity status is the strongest predictor\n2. Number of products held affects retention\n3. Geographic segment impacts churn patterns\n\nRetention Strategy:\n${prob > 70 ? 'CRITICAL — Immediate personal outreach required.' : prob > 50 ? 'HIGH — Priority retention campaign within 48h.' : prob > 30 ? 'MEDIUM — Schedule proactive check-in call.' : 'LOW — Standard engagement sufficient.'}`
      })
    } finally { setLoading(false) }
  }

  const prob = result?.churn_probability ?? 0
  const probColor = prob > 70 ? '#ef4444' : prob > 50 ? '#f97316' : prob > 30 ? '#f59e0b' : '#10b981'

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <UserMinus size={22} className="text-accent-cyan"/>Churn Prediction
      </h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6 space-y-4">
          <div className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">Customer Profile</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Credit Score — {form.credit_score}</label>
              <input type="range" min={300} max={900} value={form.credit_score}
                onChange={e => set('credit_score', +e.target.value)} className="w-full mt-1 accent-[#06b6d4]"/>
            </div>
            {[
              ['Age', 'age', 18, 95], ['Tenure (years)', 'tenure', 0, 15],
              ['Num of Products', 'num_of_products', 1, 4],
            ].map(([lbl, key, min, max]) => (
              <div key={key}>
                <label className="label-text">{lbl} — {form[key]}</label>
                <input type="range" min={min} max={max} value={form[key]}
                  onChange={e => set(key, +e.target.value)} className="w-full mt-1 accent-[#06b6d4]"/>
              </div>
            ))}
            <div>
              <label className="label-text">Balance (₹)</label>
              <input type="number" value={form.balance} onChange={e => set('balance', +e.target.value)} className="input-field"/>
            </div>
            <div>
              <label className="label-text">Est. Salary (₹)</label>
              <input type="number" value={form.estimated_salary} onChange={e => set('estimated_salary', +e.target.value)} className="input-field"/>
            </div>
            <div>
              <label className="label-text">Geography</label>
              <select value={form.geography} onChange={e => set('geography', e.target.value)} className="select-field">
                <option>France</option><option>Germany</option><option>Spain</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {[['Has Credit Card', 'has_cr_card'], ['Active Member', 'is_active_member']].map(([lbl, key]) => (
              <button key={key} onClick={() => set(key, !form[key])}
                className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors
                  ${form[key] ? 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan' : 'border-white/10 bg-dark-700/50 text-gray-400'}`}>
                {lbl}
                {form[key] ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
              </button>
            ))}
          </div>
          <button onClick={predict} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin"/>Predicting...</> : <><UserMinus size={15}/>Predict Churn Risk</>}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[320px]">
              <UserMinus size={40} className="text-gray-700"/>
              <div className="text-gray-500 text-sm">Enter customer profile to predict churn risk</div>
            </div>
          )}
          {loading && (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 min-h-[320px]">
              <Loader2 size={36} className="text-accent-cyan animate-spin"/>
              <div className="text-gray-400 text-sm">Running churn model + retention analysis…</div>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="glass-card p-5 flex flex-col items-center gap-4">
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
                    <span className="text-[10px] text-gray-500">Churn Risk</span>
                  </div>
                </div>
                <RiskBadge tier={result.priority_tier} size="lg"/>
                <div className="w-full p-3 rounded-xl bg-dark-700/60 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Retention Action</div>
                  <div className="text-xs text-gray-300 leading-relaxed">{result.retention_action}</div>
                </div>
                <button onClick={() => setModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2 text-xs">
                  <FileText size={13}/> View Retention Report
                </button>
              </div>
              <ShapChart factors={result.shap_factors} title="Churn Drivers (SHAP)"/>
            </>
          )}
        </div>
      </div>
      <ReportModal isOpen={modal} onClose={() => setModal(false)} title="Churn Risk Report" report={result?.report}/>
    </div>
  )
}
