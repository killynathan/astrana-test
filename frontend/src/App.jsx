import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import logo from './common/logo.svg'
import Notifications from './pages/Notifications'
import Preferences from './pages/Preferences'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Topbar />
        <Routes>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Notifications />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="topbar">
      <img src={logo} alt="Astrana Health" className="topbar-logo" />
      <div className="topbar-actions">
        <button
          className={`icon-btn ${location.pathname === '/notifications' ? 'active' : ''}`}
          title="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        <button
          className={`icon-btn ${location.pathname === '/analytics' ? 'active' : ''}`}
          title="Analytics"
          onClick={() => navigate('/analytics')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </button>
        <button
          className={`icon-btn ${location.pathname === '/preferences' ? 'active' : ''}`}
          title="Preferences"
          onClick={() => navigate('/preferences')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </header>
  )
}
