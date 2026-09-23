import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { leadStatuses } from './leadUtils.js'

export const statusClass = status => `status-${status.toLowerCase().replaceAll(' ', '-')}`

export default function LeadStatusDropdown({ value = 'New', onChange }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 165, direction: 'down' })

  const positionMenu = () => {
    const rect = dropdownRef.current?.getBoundingClientRect()
    if (!rect) return
    const menuWidth = Math.max(165, rect.width)
    const estimatedHeight = leadStatuses.length * 36 + 10
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < estimatedHeight + 12 && rect.top > estimatedHeight
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8)
    setPosition({
      top: openUp ? rect.top - estimatedHeight - 5 : rect.bottom + 5,
      left,
      width: menuWidth,
      direction: openUp ? 'up' : 'down',
    })
  }

  useEffect(() => {
    const close = event => {
      if (!dropdownRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!open) return
    positionMenu()
    const close = () => setOpen(false)
    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  return <div className={`custom-status ${open ? 'is-open' : ''}`} ref={dropdownRef}>
    <button type="button" className={`custom-status-trigger ${statusClass(value)}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => { if (!open) positionMenu(); setOpen(current => !current) }}><span className="status-dot" />{value}<ChevronDown size={14} /></button>
    {open && createPortal(<div ref={menuRef} className={`custom-status-menu direction-${position.direction}`} style={{ top: position.top, left: position.left, width: position.width }} role="listbox">
      {leadStatuses.map(status => <button type="button" role="option" aria-selected={status === value} key={status} className={status === value ? 'selected' : ''} onClick={() => { onChange(status); setOpen(false) }}><span className={`status-dot ${statusClass(status)}`} /><span>{status}</span>{status === value && <Check size={14} />}</button>)}
    </div>, document.body)}
  </div>
}
