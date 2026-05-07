import { useEffect, useState } from 'react'
import DropdownButton from '../common/DropdownButton'
import './Notifications.css'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  async function fetchNotifications() {
    const res = await fetch('/api/notifications')
    if (!res.ok) { setError('Failed to load notifications'); return }
    setNotifications(await res.json())
  }

  function openNotification(n) {
    if (!n.readAt) {
      const updated = { ...n, readAt: new Date().toISOString() }
      setSelected(updated)
      setNotifications(prev => prev.map(x => x.id === n.id ? updated : x))
      // optimistic write
      fetch(`/api/notifications/${n.id}/read`, { method: 'POST' })
    } else {
      setSelected(n)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const unreadCount = notifications.filter(n => !n.readAt).length

  return (
    <div className="inbox-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Inbox</h1>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
        {error && <p className="error">{error}</p>}
        <ul className="notification-list">
          {notifications.length === 0 && (
            <li className="empty">No notifications.</li>
          )}
          {notifications.map(n => (
            <li
              key={n.id}
              className={`notification-row ${!n.readAt ? 'unread' : ''} ${selected?.id === n.id ? 'active' : ''}`}
              onClick={() => openNotification(n)}
            >
              <div className="row-title">{n.title}</div>
              <div className="row-meta">{formatDate(n.createdAt)}</div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="detail">
        {selected ? (
          <>
            <div className="detail-toolbar">
              <DropdownButton
                label="Contact"
                options={[
                  { label: 'Text', onClick: () => { } },
                  { label: 'Email', onClick: () => { } },
                ]}
              />
            </div>
            <div className="detail-content">
              <h2>{selected.title}</h2>
              <p className="detail-meta">{formatDate(selected.createdAt)}</p>
              <p className="detail-body">{selected.body}</p>
              <div className="detail-tags">
                <span className="tag">{selected.eventType}</span>
                <span className="tag">{selected.eventSource}</span>
              </div>

              {/* Dummy data. We would fetch this when the notifiaction is selected */}
              <div className="patient-card">
                <div className="patient-card-header">Patient (Dummy Data)</div>
                <div className="patient-fields">
                  <div className="patient-field">
                    <span className="patient-label">Name</span>
                    <span className="patient-value">James Rivera</span>
                  </div>
                  <div className="patient-field">
                    <span className="patient-label">Date of birth</span>
                    <span className="patient-value">Mar 4, 1978</span>
                  </div>
                  <div className="patient-field">
                    <span className="patient-label">Email</span>
                    <span className="patient-value">james.rivera@email.com</span>
                  </div>
                  <div className="patient-field">
                    <span className="patient-label">Phone</span>
                    <span className="patient-value">(310) 555-0192</span>
                  </div>
                </div>

                <div className="patient-card-header" style={{ marginTop: 16 }}>Past events</div>
                <ul className="past-events">
                  <li className="past-event">
                    <span className="past-event-type">ADT_A01</span>
                    <span className="past-event-desc">Admitted to Cedar General – ED</span>
                    <span className="past-event-date">Apr 28, 2025</span>
                  </li>
                  <li className="past-event">
                    <span className="past-event-type">ADT_A02</span>
                    <span className="past-event-desc">Transferred to ICU – Cedar General</span>
                    <span className="past-event-date">Apr 30, 2025</span>
                  </li>
                  <li className="past-event">
                    <span className="past-event-type">ADT_A03</span>
                    <span className="past-event-desc">Discharged from Cedar General</span>
                    <span className="past-event-date">May 2, 2025</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="empty">Select a notification to read it.</p>
        )}
      </main>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}
