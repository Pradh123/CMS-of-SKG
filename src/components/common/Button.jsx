export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`btn ${variant === 'secondary' ? 'btn-secondary' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
