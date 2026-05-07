import { useEffect, useState } from 'react'
import './Analytics.css'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch('/api/analytics')
      if (!res.ok) { setError('Failed to load analytics'); return }
      setStats(await res.json())
    }
    fetchAnalytics()
  }, [])

  if (error) return <div className="analytics-page"><p className="analytics-error">{error}</p></div>
  if (!stats) return null

  const volumeMap = Object.fromEntries(stats.dailyVolume.map(d => [d.date, d.count]))
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - (6 - i))
    const date = d.toISOString().slice(0, 10)
    return { date, count: volumeMap[date] ?? 0 }
  })
  const maxVolume = Math.max(...last7Days.map(d => d.count), 1)

  return (
    <div className="analytics-page">
      <div className="analytics-card">
        <h2>Analytics</h2>
        <p className="analytics-subtitle">Activity for your patient panel — last 7 days.</p>

        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Notifications</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.unread}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.ackRate.toFixed(0)}%</div>
            <div className="stat-label">Acknowledgment rate</div>
          </div>
        </div>

        <div className="chart-section">
          <p className="chart-label">Event volume</p>
          <div className="bar-chart">
              {last7Days.map(d => (
                <div key={d.date} className="bar-col">
                  <div className="bar-count">{d.count}</div>
                  <div
                    className="bar"
                    style={{ height: `${(d.count / maxVolume) * 100}%` }}
                  />
                  <div className="bar-date">{formatDay(d.date)}</div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}

function formatDay(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
