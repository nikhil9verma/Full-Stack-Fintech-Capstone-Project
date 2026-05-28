import { useState, useEffect } from 'react'
import { LayoutDashboard, AlertTriangle, ShieldCheck, UserMinus, Activity, Clock, CheckCircle } from 'lucide-react'
import MetricCard from '../components/MetricCard.jsx'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { API_BASE } from '../utils/risk.js'

const RISK_COLORS = ['#10b981','#f59e0b','#f97316','#ef4444']
const RISK_DIST = [{ name:'Low',value:142 },{ name:'Medium',value:67 },{ name:'High',value:38 },{ name:'Critical',value:11 }]
const TREND = [
  {t:'9AM',a:12,f:2},{t:'10AM',a:18,f:1},{t:'11AM',a:25,f:3},
  {t:'12PM',a:22,f:4},{t:'1PM',a:30,f:2},{t:'2PM',a:28,f:1},{t:'3PM',a:35,f:5}
]
const ACTIVITY = [
  {id:1,type:'Credit',name:'Rajesh Kumar',decision:'AUTO APPROVE',risk:'LOW',time:'2m ago'},
  {id:2,type:'Fraud',name:'Txn #884721',decision:'BLOCK',risk:'CRITICAL',time:'4m ago'},
  {id:3,type:'Churn',name:'Priya Sharma',decision:'REVIEW',risk:'HIGH',time:'7m ago'},
  {id:4,type:'Lead',name:'Amit Verma',decision:'AUTO APPROVE',risk:'LOW',time:'11m ago'},
  {id:5,type:'Credit',name:'Sneha Patel',decision:'REJECT',risk:'VERY HIGH',time:'15m ago'},
  {id:6,type:'Fraud',name:'Txn #441293',decision:'ALLOW',risk:'LOW',time:'18m ago'},
]

const riskCls = r => r==='LOW'?'text-accent-green border-accent-green/30 bg-accent-green/10'
  :r==='MEDIUM'?'text-accent-yellow border-accent-yellow/30 bg-accent-yellow/10'
  :r==='HIGH'?'text-accent-orange border-accent-orange/30 bg-accent-orange/10'
  :'text-accent-red border-accent-red/30 bg-accent-red/10'

const decCls = d => d==='AUTO APPROVE'||d==='ALLOW'?'text-accent-green'
  :d==='REJECT'||d==='BLOCK'?'text-accent-red':'text-accent-yellow'

export default function Dashboard() {
  const [stats,setStats] = useState(null)
  useEffect(()=>{
    fetch(`${API_BASE}/dashboard/stats`).then(r=>r.ok?r.json():null).then(d=>d&&setStats(d)).catch(()=>{})
  },[])
  const s = stats||{total_assessments:258,fraud_alerts:23,high_risk_loans:38,churn_risks:44}

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={22} className="text-accent-cyan"/>Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time AI prediction overview</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-gray-500">
          <Activity size={13} className="text-accent-cyan animate-pulse-slow"/>Live · Updated now
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Assessments" value={s.total_assessments} icon={LayoutDashboard} color="cyan" trend="up" trendValue="+12%"/>
        <MetricCard title="Fraud Alerts (24h)" value={s.fraud_alerts} icon={AlertTriangle} color="red" trend="up" trendValue="+3"/>
        <MetricCard title="High Risk Loans" value={s.high_risk_loans} icon={ShieldCheck} color="orange" trend="down" trendValue="-5%"/>
        <MetricCard title="Churn Risks" value={s.churn_risks} icon={UserMinus} color="yellow" trend="up" trendValue="+8"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">Assessment Volume</div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-cyan"/>Assessments</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-red"/>Fraud</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={TREND} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#0d1529',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,fontSize:12}} labelStyle={{color:'#9ca3af'}}/>
              <Area type="monotone" dataKey="a" name="Assessments" stroke="#06b6d4" strokeWidth={2} fill="url(#gA)"/>
              <Area type="monotone" dataKey="f" name="Fraud" stroke="#ef4444" strokeWidth={2} fill="url(#gF)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <div className="section-title mb-3">Risk Distribution</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={RISK_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {RISK_DIST.map((_,i)=><Cell key={i} fill={RISK_COLORS[i]} strokeWidth={0}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#0d1529',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {RISK_DIST.map((d,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{background:RISK_COLORS[i]}}/>
                <span className="text-xs text-gray-400">{d.name}</span>
                <span className="text-xs text-white font-semibold ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-gray-400"/>
          <div className="section-title">Recent Activity</div>
        </div>
        <div className="space-y-1">
          {ACTIVITY.map(a=>(
            <div key={a.id} className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60 flex-shrink-0"/>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs font-medium text-white truncate">{a.name}</span>
                <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-dark-500 border border-white/5">{a.type}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskCls(a.risk)}`}>{a.risk}</span>
              <span className={`text-[10px] font-semibold ${decCls(a.decision)}`}>{a.decision}</span>
              <span className="text-[10px] text-gray-600">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="section-title mb-4">System Health</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['Credit Model','Fraud Model','Churn Model','Lead Model','Groq LLM','ChromaDB','SHAP Engine','RBI RAG'].map(m=>(
            <div key={m} className="flex items-center gap-2.5 p-3 rounded-xl bg-dark-700/50 border border-white/5">
              <CheckCircle size={13} className="text-accent-green flex-shrink-0"/>
              <span className="text-xs text-gray-300">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
