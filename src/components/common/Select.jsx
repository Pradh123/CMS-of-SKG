import { FormSelect } from './FormControls.jsx'

export default function Select({ label, options = [], className = '', ...props }) {
  return (
    <label className="block text-sm font-medium space-y-1">
      {label && <span>{label}</span>}
      <FormSelect triggerClassName={`field ${className}`} {...props}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>
    </label>
  )
}
