import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreditAssessment from './pages/CreditAssessment.jsx'

import ChurnPrediction from './pages/ChurnPrediction.jsx'
import LeadScoring from './pages/LeadScoring.jsx'
import ComplianceQA from './pages/ComplianceQA.jsx'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-800">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/credit" element={<CreditAssessment />} />

          <Route path="/churn" element={<ChurnPrediction />} />
          <Route path="/leads" element={<LeadScoring />} />
          <Route path="/compliance" element={<ComplianceQA />} />
        </Routes>
      </main>
    </div>
  )
}
