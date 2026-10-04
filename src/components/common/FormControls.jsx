import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const EDGE = 12
const GAP = 7

function useFloatingPosition(open, triggerRef, popoverRef, preferredHeight, minimumWidth = 180) {
  const [style, setStyle] = useState({})

  useEffect(() => {
    if (!open) return undefined
    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const measuredHeight = popoverRef.current?.offsetHeight || preferredHeight
      const width = Math.min(Math.max(rect.width, minimumWidth), viewportWidth - EDGE * 2)
      const below = viewportHeight - rect.bottom - EDGE
      const above = rect.top - EDGE
      const openAbove = below < Math.min(measuredHeight, 260) && above > below
      const availableHeight = Math.max(120, (openAbove ? above : below) - GAP)
      const left = Math.min(Math.max(EDGE, rect.left), viewportWidth - width - EDGE)
      setStyle({
        position: 'fixed',
        left,
        top: openAbove ? 'auto' : rect.bottom + GAP,
        bottom: openAbove ? viewportHeight - rect.top + GAP : 'auto',
        width,
        maxHeight: Math.min(preferredHeight, availableHeight),
        zIndex: 120,
      })
    }
    update()
    const frame = window.requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, popoverRef, preferredHeight, minimumWidth, triggerRef])
  return style
}

function optionText(option) {
  const content = option?.props?.children
  return typeof content === 'string' || typeof content === 'number'
    ? content
    : option?.props?.label || option?.props?.value || ''
}

export function FormSelect({
  children,
  className = '',
  triggerClassName = '',
  placeholder = 'Select an option',
  value,
  defaultValue = '',
  onChange,
  name,
  id,
  disabled = false,
  required = false,
  menuMinWidth = 180,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) {
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const options = useMemo(
    () =>
      Children.toArray(children).filter(child => isValidElement(child) && child.type === 'option'),
    [children]
  )
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = controlled ? value : internalValue
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const menuStyle = useFloatingPosition(open, triggerRef, menuRef, 260, menuMinWidth)
  const selectedIndex = options.findIndex(
    option => String(option.props.value ?? optionText(option)) === String(currentValue ?? '')
  )
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!open) return undefined
    setActiveIndex(
      selectedIndex >= 0
        ? selectedIndex
        : Math.max(
            0,
            options.findIndex(o => !o.props.disabled)
          )
    )
    const close = event => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target))
        setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open, options, selectedIndex])

  useEffect(() => {
    if (open)
      menuRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const choose = option => {
    if (!option || option.props.disabled) return
    const nextValue = option.props.value ?? optionText(option)
    if (!controlled) setInternalValue(nextValue)
    onChange?.({ target: { name, value: nextValue }, currentTarget: { name, value: nextValue } })
    setOpen(false)
    triggerRef.current?.focus()
  }
  const move = direction => {
    let next = activeIndex
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length
      if (!options[next]?.props.disabled) break
    }
    setActiveIndex(next)
  }
  const onKeyDown = event => {
    if (event.key === 'Escape') return setOpen(false)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) setOpen(true)
      else move(event.key === 'ArrowDown' ? 1 : -1)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(options[activeIndex])
    }
  }

  return (
    <span ref={rootRef} className={`form-select-wrap ${className}`}>
      <input type="hidden" name={name} value={currentValue ?? ''} />
      <button
        ref={triggerRef}
        id={id}
        className={`form-control form-select-trigger ${triggerClassName}`}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        onClick={() => setOpen(current => !current)}
        onKeyDown={onKeyDown}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedOption ? '' : 'text-slate-400'}`}>
          {selectedOption ? optionText(selectedOption) : placeholder}
        </span>
        <ChevronDown className="form-select-icon" size={17} aria-hidden="true" />
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="form-select-menu"
            style={menuStyle}
            role="listbox"
            aria-label={ariaLabel || name || 'Choose an option'}
            onKeyDown={onKeyDown}
          >
            {options.map((option, index) => {
              const optionValue = option.props.value ?? optionText(option)
              const isSelected = String(optionValue) === String(currentValue ?? '')
              return (
                <button
                  key={`${optionValue}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.props.disabled}
                  data-active={index === activeIndex}
                  className={`form-select-option${isSelected ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span className="min-w-0 flex-1 truncate">{option.props.children}</span>
                  {isSelected && <Check size={15} aria-hidden="true" />}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </span>
  )
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const toDateValue = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const parseDate = value => (value ? new Date(`${value}T00:00:00`) : null)

export function FormDatePicker({
  className = '',
  triggerClassName = '',
  name,
  id,
  value,
  defaultValue = '',
  onChange,
  min,
  max,
  disabled = false,
  required = false,
  placeholder = 'Select a date',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) {
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = controlled ? value : internalValue
  const selectedDate = parseDate(selectedValue)
  const validSelectedDate =
    selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : null
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = validSelectedDate || new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const popoverStyle = useFloatingPosition(isOpen, triggerRef, popoverRef, 390, 290)
  const days = useMemo(() => {
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay()
    const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
    return [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: dayCount }, (_, index) => index + 1),
    ]
  }, [visibleMonth])

  useEffect(() => {
    if (!isOpen) return undefined
    const close = event => {
      if (!rootRef.current?.contains(event.target) && !popoverRef.current?.contains(event.target))
        setIsOpen(false)
    }
    const escape = event => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [isOpen])

  const updateValue = nextValue => {
    if (!controlled) setInternalValue(nextValue)
    onChange?.({ target: { name, value: nextValue }, currentTarget: { name, value: nextValue } })
    setIsOpen(false)
    triggerRef.current?.focus()
  }
  const dateValueForDay = day =>
    toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
  const isOutsideRange = dateValue => (min && dateValue < min) || (max && dateValue > max)
  const todayValue = toDateValue(new Date())
  const displayValue = validSelectedDate
    ? validSelectedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : placeholder

  return (
    <span ref={rootRef} className={`form-date-wrap ${className}`}>
      <input type="hidden" name={name} value={selectedValue || ''} />
      <button
        ref={triggerRef}
        id={id}
        className={`form-control form-date form-date-trigger ${triggerClassName}`}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-required={required}
        onClick={() => {
          if (validSelectedDate)
            setVisibleMonth(
              new Date(validSelectedDate.getFullYear(), validSelectedDate.getMonth(), 1)
            )
          setIsOpen(current => !current)
        }}
      >
        <span className={selectedValue ? 'form-date-value' : 'form-date-placeholder'}>
          {displayValue}
        </span>
        <CalendarDays size={17} aria-hidden="true" />
      </button>
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            className="form-date-popover"
            style={popoverStyle}
            role="dialog"
            aria-modal="false"
            aria-label={ariaLabel || 'Choose a date'}
          >
            <div className="form-date-calendar-header">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))
                }
              >
                <ChevronLeft size={18} />
              </button>
              <strong>
                {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </strong>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="form-date-grid form-date-weekdays">
              {weekDays.map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="form-date-grid form-date-days">
              {days.map((day, index) =>
                day ? (
                  <button
                    key={day}
                    type="button"
                    disabled={isOutsideRange(dateValueForDay(day))}
                    className={
                      validSelectedDate?.getFullYear() === visibleMonth.getFullYear() &&
                      validSelectedDate?.getMonth() === visibleMonth.getMonth() &&
                      validSelectedDate?.getDate() === day
                        ? 'is-selected'
                        : ''
                    }
                    onClick={() => updateValue(dateValueForDay(day))}
                  >
                    {day}
                  </button>
                ) : (
                  <span key={`blank-${index}`} />
                )
              )}
            </div>
            <div className="form-date-calendar-footer">
              <button
                type="button"
                onClick={() => updateValue(todayValue)}
                disabled={isOutsideRange(todayValue)}
              >
                Today
              </button>
              <button type="button" onClick={() => updateValue('')}>
                Clear
              </button>
            </div>
          </div>,
          document.body
        )}
    </span>
  )
}
