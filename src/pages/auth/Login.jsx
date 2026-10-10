import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, isDevAdmin } from '../../config/devCredentials.js'
import '../../styles/login.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState(isDevAdmin ? DEV_ADMIN_EMAIL : '')
  const [password, setPassword] = useState(isDevAdmin ? DEV_ADMIN_PASSWORD : '')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (!username.trim() || !password || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError?.message || 'Email or password is incorrect.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-scene" aria-hidden="true" />
      <div className="login-container">
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-brand">
            <img src="/logo/skg-logo.png" alt="SKG Travels" />
            <strong>SKG TRAVELS</strong>
          </div>
          <div className="login-intro">
            <h1 id="login-title">Welcome back</h1>
            <p>Sign in to manage bookings, fleet and drivers.</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">
              Username{' '}
              <span className="login-required" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="email"
              placeholder="you@skgtravels.com"
              value={username}
              onChange={event => {
                setUsername(event.target.value)
                setError('')
              }}
              disabled={submitting}
              required
            />
            <div className="login-label-row">
              <label htmlFor="password">Password</label>
              <Link className="login-forgot" to="/forgot-password">
                Forgot?
              </Link>
            </div>
            <div className="login-password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={event => {
                  setPassword(event.target.value)
                  setError('')
                }}
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={submitting}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="M3 3 21 21" />}
                </svg>
              </button>
            </div>
            {error && (
              <p
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <button className="login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
            {isDevAdmin && (
              <p className="login-demo">
                Default Super Admin: <strong>{DEV_ADMIN_EMAIL}</strong> /{' '}
                <strong>{DEV_ADMIN_PASSWORD}</strong>
              </p>
            )}
          </form>
          <div className="login-card-footer">
            <span>© {new Date().getFullYear()} SKG Travels</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </section>
        <section className="login-story" aria-label="SKG Travels admin platform">
          <div className="login-story-content">
            <p className="login-story-eyebrow">SEO · BLOGS · PROMPTS</p>
            <h2>
              Your website content,
              <br className="login-story-break" /> all in one workspace.
            </h2>
            <div className="login-story-stats" aria-label="Content modules">
              <div>
                <strong>02</strong>
                <span>SEO SECTIONS</span>
              </div>
              <div>
                <strong>01</strong>
                <span>BLOG SECTION</span>
              </div>
              <div>
                <strong>01</strong>
                <span>PROMPT SECTION</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
