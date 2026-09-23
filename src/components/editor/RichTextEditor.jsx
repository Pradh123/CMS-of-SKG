import { useEffect, useRef } from 'react'
import { Bold, Code2, Expand, HelpCircle, Image, Italic, Link, List, ListOrdered, Table, Underline, Video } from 'lucide-react'

const commands = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'underline', label: 'Underline', icon: Underline },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'insertUnorderedList', label: 'Bulleted list', icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
]

export default function RichTextEditor({ label = 'Content', name, value = '', onChange, hint }) {
  const editorRef = useRef(null)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value
  }, [value])
  const emitChange = () => onChange?.({ target: { name, value: editorRef.current?.innerHTML || '' } })
  const run = (command, commandValue) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }
  const promptCommand = (message, command) => {
    const input = window.prompt(message)
    if (input) run(command, input)
  }
  return (
    <div className="rte-field">
      <label className="form-label">{label}</label>
      <div className="rich-editor">
        <div className="editor-toolbar" role="toolbar" aria-label={`${label} formatting tools`}>
          <select aria-label="Text style" defaultValue="p" onChange={event => run('formatBlock', event.target.value)}>
            <option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Quote</option>
          </select>
          {commands.slice(0, 3).map(({ command, label: itemLabel, icon: Icon }) => <button type="button" key={command} title={itemLabel} aria-label={itemLabel} onClick={() => run(command)}><Icon size={17} /></button>)}
          <select aria-label="Font" defaultValue="Arial" onChange={event => run('fontName', event.target.value)}>
            <option>Arial</option><option>Georgia</option><option>Verdana</option><option>Courier New</option>
          </select>
          <label className="color-tool" title="Text color">A<input type="color" defaultValue="#172033" onChange={event => run('foreColor', event.target.value)} /></label>
          {commands.slice(3).map(({ command, label: itemLabel, icon: Icon }) => <button type="button" key={command} title={itemLabel} aria-label={itemLabel} onClick={() => run(command)}><Icon size={17} /></button>)}
          <button type="button" title="Insert table" aria-label="Insert table" onClick={() => run('insertHTML', '<table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table>')}><Table size={17} /></button>
          <button type="button" title="Insert link" aria-label="Insert link" onClick={() => promptCommand('Enter link URL', 'createLink')}><Link size={17} /></button>
          <button type="button" title="Insert image" aria-label="Insert image" onClick={() => promptCommand('Enter image URL', 'insertImage')}><Image size={17} /></button>
          <button type="button" title="Insert video" aria-label="Insert video" onClick={() => run('insertHTML', '<p>[Video URL]</p>')}><Video size={17} /></button>
          <button type="button" title="Fullscreen" aria-label="Fullscreen editor" onClick={() => editorRef.current?.requestFullscreen?.()}><Expand size={17} /></button>
          <button type="button" title="View HTML" aria-label="View HTML" onClick={() => window.alert(editorRef.current?.innerHTML || 'No HTML yet')}><Code2 size={17} /></button>
          <button type="button" title="Editor help" aria-label="Editor help" onClick={() => window.alert('Select text and use the toolbar to format it.')}><HelpCircle size={17} /></button>
        </div>
        <div ref={editorRef} className="editor-surface" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label} onInput={emitChange} />
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
