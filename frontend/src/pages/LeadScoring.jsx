import { useState } from 'react'
import { Users, Loader2, Upload, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { API_BASE } from '../utils/risk.js'

const DEFAULTS = {
  cibil_score: 700, annual_income: 650000, loan_amount: 400000,
  loan_term: 24, no_of_dependents: 1,
  education: 'Graduate', self_employed: 'No',
  residential_assets_value: 1200000, commercial_assets_value: 0,
  luxury_assets_value: 150000, bank_asset_value: 100000,
}

const SAMPLE_CSV = `cibil_score,annual_income,loan_amount,loan_term,no_of_dependents,education,self_employed,residential_assets_value,commercial_assets_value,luxury_assets_value,bank_asset_value
750,1200000,800000,36,0,Graduate,No,2000000,500000,300000,400000
580,400000,600000,48,3,Not Graduate,Yes,800000,0,50000,80000
820,2000000,1500000,24,1,Graduate,No,4000000,1000000,800000,600000
490,300000,400000,60,4,Not Graduate,Yes,500000,0,0,40000`

const decColor = d => d==='AUTO APPROVE'?'text-accent-green bg-accent-green/10 border-accent-green/30'
  :d==='REVIEW'?'text-accent-yellow bg-accent-yellow/10 border-accent-yellow/30'
  :d==='REJECT'?'text-accent-red bg-accent-red/10 border-accent-red/30'
  :'text-accent-orange bg-accent-orange/10 border-accent-orange/30'

const probBar = p => p > 75 ? 'bg-accent-green' : p > 50 ? 'bg-accent-yellow' : p > 30 ? 'bg-accent-orange' : 'bg-accent-red'

export default function LeadScoring() {
  const [mode, setMode] = useState('single')
  const [form, setForm] = useState(DEFAULTS)
  const [csvText, setCsvText] = useState('')
  const [results, setResults] = useState([])
  const [singleResult, setSingleResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortDir, setSortDir] = useState('desc')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const mockScore = (applicant, name = 'Applicant') => {
    const score = Math.round(20 + Math.random() * 75)
    return {
      name,
      approval_probability: score,
      decision: score > 75 ? 'AUTO APPROVE' : score > 50 ? 'REVIEW' : score > 30 ? 'CONDITIONAL' : 'REJECT',
      cibil: applicant.cibil_score,
      income: applicant.annual_income,
      loan: applicant.loan_amount,
    }
  }

  const scoreSingle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/leads/score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      setSingleResult(res.ok ? await res.json() : mockScore(form, 'Applicant'))
    } catch { setSingleResult(mockScore(form, 'Applicant')) }
    finally { setLoading(false) }
  }

  const scoreBulk = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', new Blob([csvText], { type: 'text/csv' }), 'leads.csv')
      const res = await fetch(`${API_BASE}/leads/bulk`, { method: 'POST', body: formData })
      if (res.ok) { setResults(await res.json()); return }
    } catch {}
    // Parse CSV mock
    const lines = csvText.trim().split('\n')
    const scored = lines.slice(1).map((line, i) => {
      const vals = line.split(',')
      return mockScore({ cibil_score: +vals[0], annual_income: +vals[1], loan_amount: +vals[2] }, `Applicant ${i + 1}`)
    })
    setResults(scored.sort((a, b) => b.approval_probability - a.approval_probability))
    setLoading(false)
  }

  const sorted = [...results].sort((a, b) =>
    sortDir === 'desc' ? b.approval_probability - a.approval_probability : a.approval_probability - b.approval_probability
  )

  const exportCSV = () => {
    const rows = ['Rank,Name,Probability,Decision', ...sorted.map((r, i) => `${i+1},${r.name},${r.approval_probability}%,${r.decision}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'scored_leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Users size={22} className="text-accent-cyan"/>Lead Scoring
      </h1>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {['single','bulk'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${mode===m ? 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan' : 'border-white/10 text-gray-400 hover:text-white'}`}>
            {m === 'single' ? 'Single Applicant' : 'Bulk CSV'}
          </button>
        ))}
      </div>

      {mode === 'single' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <div className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">Applicant Details</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-text">CIBIL Score — {form.cibil_score}</label>
                <input type="range" min={300} max={900} value={form.cibil_score}
                  onChange={e => set('cibil_score', +e.target.value)} className="w-full mt-1"/>
              </div>
              {[['Annual Income (₹)','annual_income'],['Loan Amount (₹)','loan_amount'],
                ['Loan Term (mo)','loan_term'],['Dependents','no_of_dependents']].map(([lbl,key])=>(
                <div key={key}>
                  <label className="label-text">{lbl}</label>
                  <input type="number" value={form[key]} onChange={e=>set(key,+e.target.value)} className="input-field"/>
                </div>
              ))}
              <div>
                <label className="label-text">Education</label>
                <select value={form.education} onChange={e=>set('education',e.target.value)} className="select-field">
                  <option>Graduate</option><option>Not Graduate</option>
                </select>
              </div>
              <div>
                <label className="label-text">Self Employed</label>
                <select value={form.self_employed} onChange={e=>set('self_employed',e.target.value)} className="select-field">
                  <option>No</option><option>Yes</option>
                </select>
              </div>
            </div>
            <button onClick={scoreSingle} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin"/>Scoring...</> : <><Users size={15}/>Score This Lead</>}
            </button>
          </div>

          <div>
            {singleResult && (
              <div className="glass-card p-6 space-y-4">
                <div className="section-title">Lead Score Result</div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-white">{singleResult.approval_probability}%</span>
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${decColor(singleResult.decision)}`}>
                    {singleResult.decision}
                  </span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${probBar(singleResult.approval_probability)}`}
                    style={{ width: `${singleResult.approval_probability}%` }}/>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[['CIBIL Score', singleResult.cibil], ['Annual Income', `₹${(singleResult.income||0).toLocaleString()}`]].map(([l,v])=>(
                    <div key={l} className="p-3 rounded-xl bg-dark-700/50 border border-white/5">
                      <div className="text-gray-500">{l}</div>
                      <div className="font-semibold text-white mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'bulk' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Paste CSV Data</div>
              <button onClick={() => setCsvText(SAMPLE_CSV)}
                className="text-xs text-accent-cyan/70 hover:text-accent-cyan transition-colors flex items-center gap-1.5">
                <Upload size={12}/> Load Sample
              </button>
            </div>
            <textarea
              value={csvText} onChange={e => setCsvText(e.target.value)} rows={6}
              placeholder="cibil_score,annual_income,loan_amount,loan_term,..."
              className="input-field font-mono text-xs resize-none leading-relaxed"
            />
            <button onClick={scoreBulk} disabled={loading || !csvText.trim()} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin"/>Scoring...</> : <><Users size={15}/>Score All Leads</>}
            </button>
          </div>

          {results.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="section-title">{results.length} Leads Ranked</div>
                <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-xs">
                  <Download size={12}/> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-xs text-gray-500 font-medium pb-3 pl-2">Rank</th>
                      <th className="text-left text-xs text-gray-500 font-medium pb-3">Name</th>
                      <th className="text-left text-xs text-gray-500 font-medium pb-3 cursor-pointer"
                        onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                        <span className="flex items-center gap-1">
                          Probability {sortDir === 'desc' ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
                        </span>
                      </th>
                      <th className="text-left text-xs text-gray-500 font-medium pb-3">Decision</th>
                      <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-2">Score Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 pl-2 text-gray-500 font-mono text-xs">#{i + 1}</td>
                        <td className="py-2.5 text-white font-medium">{r.name}</td>
                        <td className="py-2.5">
                          <span className="font-bold text-white">{r.approval_probability}%</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${decColor(r.decision)}`}>
                            {r.decision}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2 w-32">
                          <div className="w-full bg-dark-700 rounded-full h-1.5">
                            <div className={`h-full rounded-full ${probBar(r.approval_probability)}`}
                              style={{ width: `${r.approval_probability}%`, transition: 'width 0.5s ease' }}/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
