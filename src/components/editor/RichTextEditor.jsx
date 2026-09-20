import Textarea from '../common/Textarea.jsx'
export default function RichTextEditor({ label = 'Content', ...props }) { return <Textarea label={label} rows={9} {...props} /> }
