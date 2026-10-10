import VideoDialog from './VideoDialog.jsx'
import { videoMarkup } from '../../utils/editorVideo.js'
import MediaPicker from '../gallery/MediaPicker.jsx'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Code2,
  Expand,
  HelpCircle,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Table,
  Underline,
  Video,
} from 'lucide-react'
import { FormSelect } from '../common/FormControls.jsx'

const commands = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'underline', label: 'Underline', icon: Underline },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'insertUnorderedList', label: 'Bulleted list', icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
]

export default function RichTextEditor({ label = 'Content', name, value = '', onChange, hint }) {
  const editorRef = useRef(null)
  const savedRange = useRef(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const [block, setBlock] = useState('p')
  const [activeCommands, setActiveCommands] = useState({})
  const captureSelection = () => {
    const selection = window.getSelection()
    if (
      selection?.rangeCount &&
      editorRef.current?.contains(selection.anchorNode) &&
      editorRef.current?.contains(selection.focusNode)
    )
      savedRange.current = selection.getRangeAt(0).cloneRange()
  }
  useEffect(() => {
    const sync = () => {
      const selection = window.getSelection()
      if (!editorRef.current?.contains(selection?.anchorNode)) return
      captureSelection()
      const element =
        selection.anchorNode.nodeType === 1
          ? selection.anchorNode
          : selection.anchorNode.parentElement
      const heading = element?.closest('h1,h2,h3,h4,h5,h6,p,blockquote')
      setBlock(heading?.tagName.toLowerCase() || 'p')
      setActiveCommands(
        Object.fromEntries(
          commands.map(item => [item.command, document.queryCommandState(item.command)])
        )
      )
    }
    document.addEventListener('selectionchange', sync)
    return () => document.removeEventListener('selectionchange', sync)
  }, [])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const openGallery = () => {
    const selection = window.getSelection()
    savedRange.current =
      selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)
        ? selection.getRangeAt(0).cloneRange()
        : null
    setGalleryOpen(true)
  }
  const insertImages = items => {
    editorRef.current?.focus()
    const selection = window.getSelection()
    const range = savedRange.current
    if (range) {
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      const end = document.createRange()
      end.selectNodeContents(editorRef.current)
      end.collapse(false)
      selection.removeAllRanges()
      selection.addRange(end)
    }
    const holder = document.createElement('div')
    for (const item of items) {
      const image = document.createElement('img')
      image.src = item.url
      image.alt = item.alt || item.name
      image.style.maxWidth = '100%'
      holder.appendChild(image)
    }
    run('insertHTML', holder.innerHTML)
  }
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value)
      editorRef.current.innerHTML = value
  }, [value])
  const emitChange = () =>
    onChange?.({ target: { name, value: editorRef.current?.innerHTML || '' } })
  const run = (command, commandValue) => {
    editorRef.current?.focus()
    const selection = window.getSelection()
    const range = savedRange.current
    if (
      range &&
      editorRef.current?.contains(range.startContainer) &&
      editorRef.current?.contains(range.endContainer)
    ) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
    document.execCommand(
      command,
      false,
      command === 'formatBlock' ? '<' + commandValue + '>' : commandValue
    )
    captureSelection()
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
        <div
          className="editor-toolbar"
          role="toolbar"
          aria-label={`${label} formatting tools`}
          onMouseDownCapture={event => {
            captureSelection()
            if (event.target.closest('button') && !event.target.closest('.form-select-trigger'))
              event.preventDefault()
          }}
        >
          <FormSelect
            className="editor-select"
            triggerClassName="editor-select-trigger"
            aria-label="Text style"
            value={block}
            onChange={event => {
              run('formatBlock', event.target.value)
              setBlock(event.target.value)
            }}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="blockquote">Quote</option>
          </FormSelect>
          {commands.slice(0, 3).map(({ command, label: itemLabel, icon: Icon }) => (
            <button
              type="button"
              key={command}
              title={itemLabel}
              aria-label={itemLabel}
              aria-pressed={Boolean(activeCommands[command])}
              onClick={() => run(command)}
            >
              <Icon size={17} />
            </button>
          ))}
          <FormSelect
            className="editor-select"
            triggerClassName="editor-select-trigger"
            aria-label="Font"
            defaultValue="system-ui"
            onChange={event => run('fontName', event.target.value)}
          >
            <option value="system-ui">System font</option>
            <option>Arial</option>
            <option>Georgia</option>
            <option>Verdana</option>
            <option>Courier New</option>
          </FormSelect>
          <label className="color-tool" title="Text color">
            A
            <input
              type="color"
              defaultValue="#172033"
              onChange={event => run('foreColor', event.target.value)}
            />
          </label>
          {commands.slice(3).map(({ command, label: itemLabel, icon: Icon }) => (
            <button
              type="button"
              key={command}
              title={itemLabel}
              aria-label={itemLabel}
              onClick={() => run(command)}
            >
              <Icon size={17} />
            </button>
          ))}
          <button
            type="button"
            title="Insert table"
            aria-label="Insert table"
            onClick={() =>
              run('insertHTML', '<table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table>')
            }
          >
            <Table size={17} />
          </button>
          <button
            type="button"
            title="Insert link"
            aria-label="Insert link"
            onClick={() => promptCommand('Enter link URL', 'createLink')}
          >
            <Link size={17} />
          </button>
          <button
            type="button"
            title="Insert image"
            aria-label="Insert image"
            onClick={openGallery}
          >
            <Image size={17} />
          </button>
          <button
            type="button"
            title="Insert video"
            aria-label="Insert video"
            onClick={() => {
              captureSelection()
              setVideoOpen(true)
            }}
          >
            <Video size={17} />
          </button>
          <button
            type="button"
            title="Fullscreen"
            aria-label="Fullscreen editor"
            onClick={() => editorRef.current?.requestFullscreen?.()}
          >
            <Expand size={17} />
          </button>
          <button
            type="button"
            title="View HTML"
            aria-label="View HTML"
            onClick={() => window.alert(editorRef.current?.innerHTML || 'No HTML yet')}
          >
            <Code2 size={17} />
          </button>
          <button
            type="button"
            title="Editor help"
            aria-label="Editor help"
            onClick={() => window.alert('Select text and use the toolbar to format it.')}
          >
            <HelpCircle size={17} />
          </button>
        </div>
        <div
          ref={editorRef}
          className="editor-surface"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={emitChange}
        />
      </div>
      <VideoDialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        onSave={(url, title) => run('insertHTML', videoMarkup(url, title))}
      />
      <MediaPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={insertImages}
      />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
