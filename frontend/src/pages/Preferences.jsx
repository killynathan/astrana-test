import { useState } from 'react'
import Chip from '../common/Chip'
import './Preferences.css'

const Mode = {
  NONE:          'none',
  AS_THEY_COME:  'as_they_come',
  DAILY_SUMMARY: 'daily_summary',
}

const RISK_LEVELS = ['High', 'Medium', 'Low']

const CHANNELS = [
  { value: 'push',  label: 'Push' },
  { value: 'sms',   label: 'SMS' },
  { value: 'email', label: 'Email' },
]

const SummaryTime = {
  START_OF_DAY: 'start_of_day',
  END_OF_DAY:   'end_of_day',
}

const SUMMARY_TIMES = [
  { value: SummaryTime.START_OF_DAY, label: 'Start of day', hint: '6:00 AM' },
  { value: SummaryTime.END_OF_DAY,   label: 'End of day',   hint: '5:00 PM' },
]

const TIMEZONES = Intl.supportedValuesOf('timeZone')
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

function ModeOption({ value, title, desc, selected, onSelect, children }) {
  return (
    <label className={`prefs-option ${selected ? 'selected' : ''}`}>
      <div className="prefs-option-header">
        <input
          type="radio"
          name="mode"
          value={value}
          checked={selected}
          onChange={onSelect}
        />
        <div className="prefs-option-content">
          <span className="prefs-option-title">{title}</span>
          <span className="prefs-option-desc">{desc}</span>
        </div>
      </div>
      {selected && children && (
        <div className="prefs-suboption" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      )}
    </label>
  )
}

export default function Preferences() {
  const [mode, setMode] = useState(Mode.AS_THEY_COME)
  const [riskLevels, setRiskLevels] = useState({ High: true, Medium: true, Low: false })
  const [summaryTime, setSummaryTime] = useState(SummaryTime.START_OF_DAY)
  const [timezone, setTimezone] = useState(detectedTimezone)
  const [channels, setChannels] = useState({ push: true, sms: false, email: false })
  const [saved, setSaved] = useState(false)

  function toggleRisk(level) {
    setRiskLevels(prev => ({ ...prev, [level]: !prev[level] }))
  }

  function toggleChannel(value) {
    setChannels(prev => ({ ...prev, [value]: !prev[value] }))
  }

  function handleSave() {
    // TODO: persist to backend
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="prefs-page">
      <div className="prefs-card">
        <h2>Notification Preferences</h2>
        <p className="prefs-subtitle">Choose how you'd like to receive patient notifications.</p>

        <div className="prefs-options">
          <ModeOption
            value={Mode.NONE}
            title="None"
            desc="Do not receive any notifications."
            selected={mode === Mode.NONE}
            onSelect={() => setMode(Mode.NONE)}
          />

          <ModeOption
            value={Mode.AS_THEY_COME}
            title="As they come"
            desc="Get notified immediately when an event occurs."
            selected={mode === Mode.AS_THEY_COME}
            onSelect={() => setMode(Mode.AS_THEY_COME)}
          >
            <p className="prefs-section-label">Notify me for patients with risk level:</p>
            <div className="chip-row">
              {RISK_LEVELS.map(level => (
                <Chip key={level} label={level} active={riskLevels[level]} onChange={() => toggleRisk(level)} />
              ))}
            </div>
          </ModeOption>

          <ModeOption
            value={Mode.DAILY_SUMMARY}
            title="Daily summary"
            desc="Receive a single digest at a time you choose if new events present."
            selected={mode === Mode.DAILY_SUMMARY}
            onSelect={() => setMode(Mode.DAILY_SUMMARY)}
          >
            <p className="prefs-section-label">Send my daily summary at:</p>
            <div className="chip-row" style={{ marginBottom: 16 }}>
              {SUMMARY_TIMES.map(t => (
                <Chip key={t.value} label={t.label} hint={t.hint} active={summaryTime === t.value} onChange={() => setSummaryTime(t.value)} type="radio" name="summaryTime" />
              ))}
            </div>
            <p className="prefs-section-label">Time zone:</p>
            <select className="tz-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </ModeOption>
        </div>

        {mode !== Mode.NONE && (
          <div className="prefs-group">
            <p className="prefs-group-label">Receive notifications via:</p>
            <div className="chip-row">
              {CHANNELS.map(ch => (
                <Chip key={ch.value} label={ch.label} active={channels[ch.value]} onChange={() => toggleChannel(ch.value)} />
              ))}
            </div>
          </div>
        )}

        <div className="prefs-footer">
          <button className="save-btn" onClick={handleSave}>Save preferences</button>
          {saved && <span className="save-confirm">Saved</span>}
        </div>
      </div>
    </div>
  )
}
