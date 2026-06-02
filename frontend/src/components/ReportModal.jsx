import { useEffect, useRef } from 'react'
import { X, FileText, Download } from 'lucide-react'

export default function ReportModal({ isOpen, onClose, title = 'AI Assessment Report', report = '', children }) {
  const overlayRef = useRef()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleDownload = () => {
    const blob = new Blob([report || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4"
    >
      <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
              <FileText size={15} className="text-accent-cyan" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Groq LLaMA 3.3 70B</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <button onClick={handleDownload} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                <Download size={12} /> Export
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children || (
            report ? (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-dark-700/50 rounded-xl p-4 border border-white/5">
                {report}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">No report available</div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
