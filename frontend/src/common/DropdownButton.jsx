import { useEffect, useRef, useState } from 'react'
import './DropdownButton.css'

export default function DropdownButton({ label, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dropdown" ref={ref}>
      <button className="dropdown-trigger" onClick={() => setOpen(o => !o)}>
        {label} <span className="dropdown-arrow">▾</span>
      </button>
      {open && (
        <ul className="dropdown-menu">
          {options.map(opt => (
            <li key={opt.label} onClick={() => { opt.onClick(); setOpen(false) }}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
