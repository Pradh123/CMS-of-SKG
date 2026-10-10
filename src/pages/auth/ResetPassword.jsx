import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import '../../styles/forgot-password.css'

const validPassword = value =>
  value.length >= 8 &&
  value.length <= 128 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value)

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!token) {
      setError('This password reset link is missing its token. Request a new link.')
      return
    }
    if (password !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (!validPassword(password)) {
      setError('Use 8-128 characters with uppercase, lowercase, a number, and a symbol.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await resetPassword({ token, newPassword: password })
      setComplete(true)
      setPassword('')
      setConfirmPassword('')
    } catch (requestError) {
      setError(requestError?.message || 'Password could not be reset. Request a new link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card" aria-labelledby="reset-title">
        <img className="forgot-logo" src="/logo/skg-logo.png" alt="SKG Travels" />
        <h1 id="reset-title">Set a new password</h1>
        {complete ? (
          <>
            <p className="forgot-notice" role="status">
              Your password has been reset. You can now sign in with the new password.
            </p>
            <Link className="forgot-back" to="/login">
              Continue to Login
            </Link>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="forgot-form">
              <label className="sr-only" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value)
                  setError('')
                }}
                minLength="8"
                maxLength="128"
                disabled={submitting}
                required
              />
              <label className="sr-only" htmlFor="confirm-new-password">
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={event => {
                  setConfirmPassword(event.target.value)
                  setError('')
                }}
                minLength="8"
                maxLength="128"
                disabled={submitting}
                required
              />
              <p>Use uppercase, lowercase, a number, and a symbol.</p>
              <button type="submit" disabled={submitting || !token}>
                {submitting ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
            {!token && (
              <p className="forgot-notice border-amber-200 bg-amber-50 text-amber-800" role="alert">
                This reset link has no token. Request a new password reset link.
              </p>
            )}
            {error && (
              <p className="forgot-notice border-rose-200 bg-rose-50 text-rose-700" role="alert">
                {error}
              </p>
            )}
            <Link className="forgot-back" to="/forgot-password">
              Request a new link
            </Link>
          </>
        )}
      </section>
      <section className="forgot-story" aria-label="About SKG Admin CMS">
        <p className="forgot-story-kicker">SKG ADMIN CMS</p>
        <h2>Secure access to your workspace.</h2>
        <p>Choose a strong password that you do not use for another account.</p>
      </section>
    </main>
  )
}
