import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PrimaryButton } from '../components/ui'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', target_role: '', experience_level: 'fresher',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Rocket className="text-signal" size={26} />
          <span className="font-display font-bold text-2xl text-ink">PrepPilot</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h1 className="font-display font-semibold text-xl text-ink mb-1">Create your account</h1>
          <p className="text-sm text-slate-600 mb-6">Start practicing for your placement interviews today.</p>

          {error && (
            <div className="bg-danger-light text-danger text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
                placeholder="Priya Sharma"
              />
            </div>
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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Target role</label>
              <input
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">Experience level</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm"
              >
                <option value="fresher">Fresher</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <PrimaryButton type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Creating account…' : 'Create account'}
            </PrimaryButton>
          </form>

          <p className="text-sm text-slate-600 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-signal font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
