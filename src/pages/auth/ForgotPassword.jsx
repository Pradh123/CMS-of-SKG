import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/forgot-password.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setNotice(true)
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
            }}
            required
          />
          <p>
            Don’t remember your email?{' '}
            <a className="forgot-support" href="mailto:skgtravels123@gmail.com">
              Contact Support
            </a>
            .
          </p>
          <button type="submit">Reset Password</button>
        </form>
        {notice && (
          <p className="forgot-notice" role="status">
            Password reset emails are not available in this preview. Please contact your
            administrator for access.
          </p>
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
