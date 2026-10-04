import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export function FormSelect({ children, className = '', ...props }) {
  const rootRef = useRef(null)
  const optionList = useMemo(() => Array.isArray(children) ? children : [children], [children])
  const [open, setOpen] = useState(false)
  const selectRef = useRef(null)
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? '')
  const currentValue = props.value ?? internalValue
  const selectedOption = optionList.find(option => option?.props?.value === currentValue || (option?.props?.value === undefined && option?.props?.children === currentValue))

  useEffect(() => {
    if (!open) return undefined
    const close = event => { if (!rootRef.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const choose = option => {
    if (option.props.disabled) return
    const nextValue = option.props.value ?? option.props.children
    if (props.value === undefined) setInternalValue(nextValue)
    if (selectRef.current) {
      selectRef.current.value = nextValue
      selectRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setOpen(false)
  }

  return (
    <span ref={rootRef} className={`form-select-wrap ${className}`}>
      <select ref={selectRef} className="form-control form-select-native" tabIndex={-1} aria-hidden="true" {...props}>{children}</select>
      <button className="form-control form-select-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span>{selectedOption?.props?.children ?? 'Select an option'}</span>
        <ChevronDown className="form-select-icon" size={17} aria-hidden="true" />
      </button>
      {open && <div className="form-select-menu" role="listbox" aria-label={props['aria-label'] || props.name}>
        {optionList.map((option, index) => {
          if (!option || option.type !== 'option') return null
          const optionValue = option.props.value ?? option.props.children
          const isSelected = String(optionValue) === String(currentValue)
          return <button key={`${optionValue}-${index}`} type="button" role="option" aria-selected={isSelected} disabled={option.props.disabled} className={`form-select-option${isSelected ? ' is-selected' : ''}`} onClick={() => choose(option)}>{option.props.children}</button>
        })}
      </div>}
    </span>
  )
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const toDateValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function FormDatePicker({ className = '', name, value, defaultValue = '', onChange, ...props }) {
  const rootRef = useRef(null)
  const popoverRef = useRef(null)
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = isControlled ? value : internalValue
  const [isOpen, setIsOpen] = useState(false)
  const [opensUp, setOpensUp] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedValue ? new Date(`${selectedValue}T00:00:00`) : new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const days = useMemo(() => {
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay()
    const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
    return [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)]
  }, [visibleMonth])

  useEffect(() => {
    if (!isOpen) return undefined
    const updatePopoverPosition = () => {
      const root = rootRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      const popoverHeight = popoverRef.current?.getBoundingClientRect().height || 330
      const popoverWidth = Math.min(310, window.innerWidth - 24)
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setOpensUp(spaceBelow < popoverHeight + 12 && spaceAbove > spaceBelow)
      setAlignRight(rect.left + popoverWidth > window.innerWidth - 12)
    }
    const closeOnOutsideClick = event => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)
    updatePopoverPosition()
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
    }
  }, [isOpen])

  const chooseDate = day => {
    const nextDate = toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
    if (!isControlled) setInternalValue(nextDate)
    onChange?.({ target: { name, value: nextDate } })
    setIsOpen(false)
  }

  const selectedDate = selectedValue ? new Date(`${selectedValue}T00:00:00`) : null
  const displayValue = selectedDate && !Number.isNaN(selectedDate.getTime())
    ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Select a date'

  return (
    <span ref={rootRef} className={`form-date-wrap ${className}`}>
      <input type="hidden" name={name} value={selectedValue || ''} />
      <button
        className="form-control form-date form-date-trigger flex items-center justify-between gap-1"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (selectedDate && !Number.isNaN(selectedDate.getTime())) setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
          setIsOpen(current => !current)
        }}
        {...props}
      >
        <span className={selectedValue ? 'form-date-value' : 'form-date-placeholder'}>{displayValue}</span>
        <CalendarDays size={17} aria-hidden="true" />
      </button>
      {isOpen && <div ref={popoverRef} className={`form-date-popover${opensUp ? ' form-date-popover-up' : ''}${alignRight ? ' form-date-popover-right' : ''}`} role="dialog" aria-label="Choose a date">
        <div className="form-date-calendar-header">
          <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
          <strong>{monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</strong>
          <button type="button" aria-label="Next month" onClick={() => setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
        </div>
        <div className="form-date-grid form-date-weekdays">{weekDays.map(day => <span key={day}>{day}</span>)}</div>
        <div className="form-date-grid form-date-days">
          {days.map((day, index) => day
            ? <button key={day} type="button" className={selectedDate?.getFullYear() === visibleMonth.getFullYear() && selectedDate?.getMonth() === visibleMonth.getMonth() && selectedDate?.getDate() === day ? 'is-selected' : ''} onClick={() => chooseDate(day)}>{day}</button>
            : <span key={`blank-${index}`} />)}
        </div>
        <div className="form-date-calendar-footer">
          <button type="button" onClick={() => chooseDate(new Date().getDate())}>Today</button>
          <button type="button" onClick={() => { if (!isControlled) setInternalValue(''); onChange?.({ target: { name, value: '' } }); setIsOpen(false) }}>Clear</button>
        </div>
      </div>}
    </span>
  )
}
