import Input from '../common/Input.jsx'
export default function ImageUploader({ value, onChange }) { return <Input label="Image URL" type="url" value={value} onChange={onChange} placeholder="https://example.com/image.jpg" /> }
