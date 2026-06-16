export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-slate-100 p-6 ${className}`}>
      {children}
    </div>
  )
}

export function ScoreBadge({ score, max = 10 }) {
  if (score === null || score === undefined) {
    return <span className="text-slate-400 text-sm">Not scored</span>
  }
  const pct = (score / max) * 100
  let tone = 'bg-danger-light text-danger'
  if (pct >= 70) tone = 'bg-pulse-light text-pulse'
  else if (pct >= 40) tone = 'bg-caution-light text-caution'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold font-mono ${tone}`}>
      {Number(score).toFixed(1)} / {max}
    </span>
  )
}

export function DifficultyBadge({ difficulty }) {
  const map = {
    Easy: 'bg-pulse-light text-pulse',
    Medium: 'bg-caution-light text-caution',
    Hard: 'bg-danger-light text-danger',
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${map[difficulty] || 'bg-slate-100 text-slate-600'}`}>
      {difficulty}
    </span>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-slate-600 py-10 justify-center">
      <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-signal hover:bg-signal-dark text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
