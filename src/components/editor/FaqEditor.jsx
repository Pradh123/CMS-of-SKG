import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import RichTextEditor from './RichTextEditor.jsx'
import RequiredMark from '../common/RequiredMark.jsx'
import { stripHtml } from '../../utils/seoContent.js'

export default function FaqEditor({ value = [], onChange }) {
  const faqs = Array.isArray(value) ? value : []
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const dialog = useRef(null)
  const open = Boolean(draft)
  useEffect(() => {
    if (open) dialog.current?.showModal()
  }, [open])
  function openEditor(index = -1) {
    setError('')
    setDraft({
      index,
      title: index < 0 ? '' : faqs[index].title,
      description: index < 0 ? '' : faqs[index].description,
    })
  }
  function saveFaq(event) {
    event.preventDefault()
    event.stopPropagation()
    if (
      !draft.title.trim() ||
      !stripHtml(draft.description)
        .replace(/&nbsp;|&#160;/gi, ' ')
        .trim()
    ) {
      setError('Add a question title and an answer before saving.')
      return
    }
    if (draft.description.length > 50000) {
      setError('The answer must be no longer than 50,000 characters.')
      return
    }
    const faq = { title: draft.title.trim(), description: draft.description.trim() }
    onChange(
      draft.index < 0
        ? [...faqs, faq]
        : faqs.map((item, index) => (index === draft.index ? faq : item))
    )
    setDraft(null)
  }
  return (
    <section className="seo-section faq-editor">
      <div className="faq-editor-heading">
        <span className="faq-editor-icon">
          <CircleHelp size={21} aria-hidden="true" />
        </span>
        <div className="faq-editor-heading-copy">
          <h2>Frequently asked questions</h2>
          <p>Add FAQs to this list, then save the page to apply your changes.</p>
        </div>
        <span className="faq-editor-count">{faqs.length}/30 FAQs</span>
      </div>
      {!faqs.length && (
        <div className="faq-editor-empty">
          <span>
            <CircleHelp size={28} aria-hidden="true" />
          </span>
          <h3>No FAQs added yet</h3>
          <p>Click Add FAQ to write a question and answer.</p>
        </div>
      )}
      <div className="faq-saved-list">
        {faqs.map((faq, index) => (
          <article className="faq-saved-row" key={index}>
            <span className="faq-saved-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="faq-saved-copy">
              <h3>{faq.title}</h3>
              <p>{stripHtml(faq.description)}</p>
            </div>
            <div className="faq-saved-actions">
              <button
                type="button"
                className="faq-editor-edit"
                title="Edit FAQ"
                aria-label={`Edit FAQ ${index + 1}`}
                onClick={() => openEditor(index)}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="faq-editor-remove"
                title="Remove FAQ"
                aria-label={`Remove FAQ ${index + 1}`}
                onClick={() => onChange(faqs.filter((_, position) => position !== index))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="faq-editor-add"
        disabled={faqs.length >= 30}
        onClick={() => openEditor()}
      >
        <Plus size={16} /> Add FAQ
      </button>
      {draft &&
        createPortal(
          <dialog
            ref={dialog}
            className="media-dialog faq-entry-dialog"
            aria-labelledby="faq-entry-title"
            onCancel={() => setDraft(null)}
          >
            <div className="media-dialog-heading">
              <div>
                <h2 id="faq-entry-title">{draft.index < 0 ? 'Add FAQ' : 'Edit FAQ'}</h2>
                <p>Save this question to the list. Save the page to apply all changes.</p>
              </div>
              <button type="button" aria-label="Close FAQ editor" onClick={() => setDraft(null)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={saveFaq}>
              <div className="faq-entry-body">
                <label className="seo-field">
                  <span className="form-label">
                    Title / Question <RequiredMark />
                  </span>
                  <input
                    autoFocus
                    required
                    maxLength={300}
                    className="field"
                    value={draft.title || ''}
                    onChange={event =>
                      setDraft(current => ({ ...current, title: event.target.value }))
                    }
                    placeholder="e.g. How can I book this trip?"
                  />
                </label>
                <RichTextEditor
                  label="Description / Answer"
                  name="faq-answer"
                  value={draft.description || ''}
                  onChange={event =>
                    setDraft(current => ({ ...current, description: event.target.value }))
                  }
                />
                {error && (
                  <p className="faq-entry-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <div className="faq-entry-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save FAQ
                </button>
              </div>
            </form>
          </dialog>,
          document.body
        )}
    </section>
  )
}
