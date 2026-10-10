import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import '../../styles/forgot-password.css'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setNotice(false)
    setError('')
    try {
      const response = await forgotPassword(email)
      setResetToken(response?.resetToken || '')
      setNotice(true)
    } catch (requestError) {
      setError(requestError?.message || 'Reset request could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card" aria-labelledby="forgot-title">
        <img className="forgot-logo" src="/logo/skg-logo.png" alt="SKG Travels" />
        <h1 id="forgot-title">Forgot your password?</h1>
        <form onSubmit={handleSubmit} className="forgot-form">
          <label className="sr-only" htmlFor="reset-email">
            Your Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="Your Email"
            value={email}
            onChange={event => {
              setEmail(event.target.value)
              setNotice(false)
              setResetToken('')
              setError('')
            }}
            disabled={submitting}
            required
          />
          <p>
            Don’t remember your email?{' '}
            <a className="forgot-support" href="mailto:skgtravels123@gmail.com">
              Contact Support
            </a>
            .
          </p>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Reset Password'}
          </button>
        </form>
        {error && (
          <p className="forgot-notice border-rose-200 bg-rose-50 text-rose-700" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <div className="forgot-notice" role="status">
            <p>If an account exists for this email, password reset instructions have been sent.</p>
            {resetToken && (
              <Link
                className="mt-3 inline-flex font-semibold text-blue-700 underline"
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              >
                Continue with development reset token
              </Link>
            )}
          </div>
        )}
        <Link className="forgot-back" to="/login">
          Back to Login
        </Link>
      </section>
      <section className="forgot-story" aria-label="About SKG Admin CMS">
        <p className="forgot-story-kicker">SKG ADMIN CMS</p>
        <h2>Your content workspace is ready when you are.</h2>
        <p>Manage area SEO, route SEO, blogs and ChatGPT prompts together in one place.</p>
      </section>
    </main>
  )
}
