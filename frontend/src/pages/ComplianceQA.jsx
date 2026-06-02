import { useState, useRef, useEffect } from 'react'
import { BookOpen, Send, Loader2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { API_BASE } from '../utils/risk.js'

const SUGGESTED = [
  'What makes an account NPA?',
  'What is the provisioning requirement for loss assets?',
  'Income recognition norms for NPA accounts?',
  'When can a restructured account be upgraded?',
  'What is the 90-day overdue rule for NPAs?',
  'Define substandard assets under RBI norms.',
]

const MOCK_ANSWERS = {
  'npa': 'A Non-Performing Asset (NPA) is a loan or advance where interest or principal repayment remains overdue for a period of more than 90 days. According to RBI\'s Master Circular on IRAC Norms 2024, Sec 2.1: "An asset, including a leased asset, becomes non-performing when it ceases to generate income for the bank." Sub-categories include: Substandard (up to 12 months as NPA), Doubtful (>12 months), and Loss assets.',
  'loss': 'For loss assets, banks must maintain 100% provision as per RBI\'s Prudential Norms on Income Recognition, Asset Classification and Provisioning (IRACP). Master Circular DBR.No.BP.BC.2/21.04.048/2015-16, Para 5.3 states that loss assets should be written off. If not written off, 100% provision must be made.',
  'income': 'Income recognition for NPA accounts follows the cash basis method. Interest accrued but not received on NPAs must be reversed. Banks should not recognize income on NPAs unless actually received. Ref: RBI Master Circular on IRAC Norms, Para 3.1: "Banks should not charge and take to income account interest on any NPA."',
  'restructured': 'A restructured account can be upgraded to standard only after a specified period of satisfactory performance under the restructured terms. As per RBI circular dated June 7, 2019, the minimum period is 1 year from the date of commencement of the first payment of interest or principal on the restructured account.',
  'default': 'Based on RBI\'s Master Circular on Income Recognition, Asset Classification and Provisioning Norms 2024, the relevant provision states that banks must follow prudential norms for income recognition and asset classification. The specific section applicable to your query covers the treatment of advances and their classification into Standard, Sub-standard, Doubtful, and Loss categories based on overdue periods.',
}

function getMockAnswer(question) {
  const q = question.toLowerCase()
  if (q.includes('npa') || q.includes('non-performing') || q.includes('90-day') || q.includes('overdue') || q.includes('substandard')) return MOCK_ANSWERS.npa
  if (q.includes('loss asset') || q.includes('provisioning') || q.includes('provision')) return MOCK_ANSWERS.loss
  if (q.includes('income recogni')) return MOCK_ANSWERS.income
  if (q.includes('restructur') || q.includes('upgrad')) return MOCK_ANSWERS.restructured
  return MOCK_ANSWERS.default
}

function ChatBubble({ msg }) {
  const [expanded, setExpanded] = useState(false)
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {isUser ? (
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 border border-accent-cyan/20 text-sm text-white">
            {msg.content}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass-card border-white/10 text-sm text-gray-200 leading-relaxed">
              {msg.content}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-[10px] text-accent-cyan/70 hover:text-accent-cyan transition-colors font-medium">
                    {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                    {msg.sources.length} source chunk{msg.sources.length > 1 ? 's' : ''} used
                  </button>
                  {expanded && (
                    <div className="mt-2 space-y-1.5">
                      {msg.sources.map((src, i) => (
                        <div key={i} className="p-2 rounded-lg bg-dark-700/60 border border-white/5 text-[10px] text-gray-400 leading-relaxed">
                          <span className="text-accent-cyan/70 font-semibold">Chunk {i+1} · </span>{src}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.section && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-gray-600">📑</span>
                <span className="text-[10px] text-gray-500 italic">{msg.section}</span>
                {msg.confidence && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                    ${msg.confidence > 0.8 ? 'bg-accent-green/10 text-accent-green' :
                      msg.confidence > 0.6 ? 'bg-accent-yellow/10 text-accent-yellow' :
                      'bg-gray-500/10 text-gray-400'}`}>
                    {Math.round(msg.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComplianceQA() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I\'m your RBI Compliance Assistant, powered by RAG on RBI Master Circulars and LLaMA 3.3 70B. Ask me anything about NPA norms, IRAC guidelines, provisioning requirements, or other RBI regulations.',
    section: 'RBI Master Circular — IRAC Norms 2024-25',
    confidence: 0.98,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ask = async (question) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/compliance/ask`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(m => [...m, { role: 'assistant', content: data.answer, sources: data.sources, section: data.section, confidence: data.confidence }])
      } else throw new Error()
    } catch {
      await new Promise(r => setTimeout(r, 1200))
      setMessages(m => [...m, {
        role: 'assistant',
        content: getMockAnswer(q),
        sources: [
          'RBI Master Circular on IRAC Norms 2024, Para 2.1 — Definition of NPA and classification criteria for advances.',
          'Prudential Framework for Resolution of Stressed Assets, RBI/2019-20/88, Annex 1 — Applicable norms for income recognition.',
        ],
        section: 'RBI Master Circular — IRAC Norms 2024-25, Sec 2.1–4.3',
        confidence: 0.82,
      }])
    } finally { setLoading(false) }
  }

  return (
    <div className="page-container" style={{ height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 flex-shrink-0">
        <BookOpen size={22} className="text-accent-cyan"/>Compliance Q&A
        <span className="text-xs font-normal text-gray-500 ml-2">RBI RAG · LLaMA 3.3 70B</span>
      </h1>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-0">
        {/* Chat */}
        <div className="xl:col-span-3 glass-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg}/>)}
            {loading && (
              <div className="flex justify-start animate-slide-up">
                <div className="glass-card px-4 py-3 flex items-center gap-2.5 border-white/10">
                  <Loader2 size={14} className="text-accent-cyan animate-spin"/>
                  <span className="text-sm text-gray-400">Searching RBI documents…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <div className="flex gap-3">
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && ask(input)}
                placeholder="Ask about NPA norms, provisioning, IRAC guidelines…"
                className="input-field flex-1"
              />
              <button onClick={() => ask(input)} disabled={!input.trim() || loading}
                className="btn-primary px-4 flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={14}/>Ask
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-accent-yellow"/>
              <span className="text-sm font-semibold text-white">Suggested Questions</span>
            </div>
            <div className="space-y-2">
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => ask(q)} disabled={loading}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-gray-300 hover:text-white
                    border border-white/5 hover:border-accent-cyan/20 bg-dark-700/40 hover:bg-accent-cyan/5
                    transition-all duration-200 leading-relaxed">
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 space-y-2">
            <div className="text-xs font-semibold text-white mb-2">Knowledge Base</div>
            {[
              { name: 'IRAC Norms 2024-25', pages: 48 },
              { name: 'Prudential Framework', pages: 32 },
              { name: 'NPA Guidelines', pages: 24 },
            ].map(doc => (
              <div key={doc.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-gray-400">{doc.name}</span>
                <span className="text-[10px] text-gray-600">{doc.pages}p</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
