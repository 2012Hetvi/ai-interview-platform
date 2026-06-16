import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Rocket className="text-signal" size={26} />
          <span className="font-display font-bold text-2xl text-ink">PrepPilot</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h1 className="font-display font-semibold text-xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-slate-600 mb-6">Log in to continue your placement prep.</p>

          {error && (
            <div className="bg-danger-light text-danger text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
            <PrimaryButton type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Logging in…' : 'Log in'}
            </PrimaryButton>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            New here?{' '}
            <Link to="/register" className="text-signal font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
