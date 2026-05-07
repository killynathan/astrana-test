import './Chip.css'

export default function Chip({ label, hint, active, onChange, type = 'checkbox', name }) {
  return (
    <label className={`chip ${active ? 'active' : ''}`}>
      <input type={type} name={name} checked={active} onChange={onChange} />
      {label}
      {hint && <span className="chip-hint">{hint}</span>}
    </label>
  )
}
