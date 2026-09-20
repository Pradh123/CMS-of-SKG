import Input from '../common/Input.jsx'
import Textarea from '../common/Textarea.jsx'
export default function SEOFields({ value, onChange }) {
  return (
    <div className="grid gap-4">
      <Input
        label="Meta title"
        value={value.metaTitle || ''}
        onChange={event => onChange({ ...value, metaTitle: event.target.value })}
      />
      <Textarea
        label="Meta description"
        value={value.metaDescription || ''}
        onChange={event => onChange({ ...value, metaDescription: event.target.value })}
      />
    </div>
  )
}
