import assert from 'node:assert/strict'
import test from 'node:test'
import { countState, seoChecklist, serpPreview, stripHtml } from '../src/utils/seoContent.js'

test('stripHtml removes tags and entities but keeps readable text', () => {
  assert.equal(stripHtml('<p>Call <strong>now</strong> &amp; book.</p>'), 'Call now & book.')
  assert.equal(stripHtml(''), '')
  assert.equal(stripHtml(null), '')
})

test('serpPreview falls back to content text and trims to search limits', () => {
  const preview = serpPreview({
    title: 'Mumbai to Pune Cab | SKG Travels',
    slug: 'mumbai-to-pune-cab',
    content: `<p>${'Long content. '.repeat(30)}</p>`,
  })
  assert.equal(preview.url, 'https://skgtravels.com/mumbai-to-pune-cab')
  assert.ok(preview.title.length <= 60)
  assert.ok(preview.description.length <= 160)
  assert.ok(preview.description.endsWith('…'))

  const explicit = serpPreview({
    title: 'Short',
    slug: '',
    description: 'A concise hand-written description.',
  })
  assert.equal(explicit.url, 'https://skgtravels.com/your-page')
  assert.equal(explicit.description, 'A concise hand-written description.')
})

test('countState classifies lengths against the target range', () => {
  assert.equal(countState(0, { min: 30, max: 60 }), 'empty')
  assert.equal(countState(10, { min: 30, max: 60 }), 'warn')
  assert.equal(countState(45, { min: 30, max: 60 }), 'ok')
  assert.equal(countState(90, { min: 30, max: 60 }), 'warn')
})

test('seoChecklist reports a complete record as ready', () => {
  const checklist = seoChecklist({
    metaTitle: 'Mumbai to Pune Cab Booking | SKG Travels',
    metaDescription:
      'Book a Mumbai to Pune cab with transparent per-kilometre fares, verified drivers and 24/7 support from SKG Travels.',
    content: '<p>' + 'Great rides start here. '.repeat(30) + '</p>',
    image: 'https://cdn.example.com/cover.webp',
    slug: 'mumbai-to-pune-cab',
  })
  assert.deepEqual(
    checklist.map(item => item.state),
    ['ok', 'ok', 'ok', 'ok', 'ok']
  )
})

test('seoChecklist flags missing SEO essentials', () => {
  const checklist = seoChecklist({ title: 'Only a title' })
  const byLabel = Object.fromEntries(checklist.map(item => [item.label, item]))
  assert.equal(byLabel['SEO title length'].state, 'empty')
  assert.equal(byLabel['Meta description length'].state, 'empty')
  assert.equal(byLabel['Content length'].state, 'empty')
  assert.equal(byLabel['Featured image'].state, 'empty')
  assert.equal(byLabel['Public URL'].state, 'warn')
  assert.match(byLabel['Public URL'].detail, /generated from the title/)
})
