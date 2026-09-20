export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-7">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
