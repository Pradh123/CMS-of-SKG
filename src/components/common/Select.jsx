import { ChevronDown } from 'lucide-react'

export default function Select({ label, options = [], ...props }) {
  return (
    <label className="block text-sm font-medium space-y-1">
      {label && <span>{label}</span>}
      <span className="form-select-wrap">
        <select className="field form-select" {...props}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="form-select-icon" size={17} aria-hidden="true" />
      </span>
    </label>
  )
}
