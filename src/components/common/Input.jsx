import RequiredMark from './RequiredMark.jsx'
export default function Input({ label, id, ...props }) {
  return (
    <label className="block text-sm font-medium space-y-1">
      {label && (
        <span>
          {label}
          {props.required && <RequiredMark />}
        </span>
      )}
      <input id={id} className="field" {...props} />
    </label>
  )
}
