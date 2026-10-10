import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePermissions, visiblePanels } from '../src/config/accessControl.js'

test('does not crash when the signed-out session is null', () => {
  const permissions = normalizePermissions(null)
  assert.equal(typeof permissions, 'object')
  assert.ok(Array.isArray(permissions['/']))
  assert.deepEqual(visiblePanels(null), [])
})

test('keeps saved module permissions for a signed-in admin', () => {
  const permissions = normalizePermissions({
    role: 'Admin',
    permissions: {
      '/': ['view'],
      '/leads': ['view', 'edit'],
    },
  })
  assert.deepEqual(permissions['/'], ['view'])
  assert.deepEqual(permissions['/leads'], ['view', 'edit'])
})
