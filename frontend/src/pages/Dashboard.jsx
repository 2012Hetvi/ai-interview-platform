import { useEffect, useState } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Mic, Code2, MessageSquareText, Calculator, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { Card, Spinner } from '../components/ui'

function StatTile({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex items-start gap-4">
      <div className="bg-signal-light p-2.5 rounded-xl">
        <Icon className="text-signal" size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading your dashboard…" />
  if (!stats) return null

  const radarData = [
    { area: 'Interview', score: stats.avg_interview_score || 0 },
    { area: 'Coding', score: (stats.coding_accuracy_percent || 0) / 10 },
    { area: 'Behavioral', score: stats.avg_behavioral_score || 0 },
    { area: 'Aptitude', score: (stats.avg_aptitude_score || 0) / 10 },
  ]

  const readiness = Math.round(
    (radarData.reduce((sum, d) => sum + d.score, 0) / (radarData.length * 10)) * 100
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Here's where your placement prep stands right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-slate-600 mb-2">Overall Readiness</p>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#EEF0F4" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="#5B5FEF" strokeWidth="12"
                strokeDasharray={`${(readiness / 100) * 326.7} 326.7`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-display font-bold text-3xl text-ink">{readiness}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Combined score across interview, coding, behavioral &amp; aptitude practice
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-600 mb-2">Skill Breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#DFE2E8" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#5B5FEF" fill="#5B5FEF" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Mic} label="Mock Interviews" value={stats.total_mock_interviews}
          sub={stats.avg_interview_score ? `Avg ${stats.avg_interview_score.toFixed(1)}/10` : 'No data yet'} />
        <StatTile icon={Code2} label="Coding Submissions" value={stats.total_coding_submissions}
          sub={stats.coding_accuracy_percent != null ? `${stats.coding_accuracy_percent}% accuracy` : 'No data yet'} />
        <StatTile icon={MessageSquareText} label="Behavioral Answers" value={stats.total_behavioral_responses}
          sub={stats.avg_behavioral_score ? `Avg ${stats.avg_behavioral_score.toFixed(1)}/10` : 'No data yet'} />
        <StatTile icon={Calculator} label="Aptitude Attempts" value={stats.total_aptitude_attempts}
          sub={stats.avg_aptitude_score ? `Avg ${stats.avg_aptitude_score.toFixed(0)}%` : 'No data yet'} />
      </div>

      {stats.score_trend?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-signal" />
            <p className="text-sm font-medium text-slate-800">Interview score trend</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.score_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F4" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#5B5FEF" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {(stats.strengths?.length > 0 || stats.weaknesses?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <p className="text-sm font-medium text-pulse mb-2">Strengths</p>
            <p className="text-sm text-slate-600">
              {stats.strengths.length ? stats.strengths.join(', ') : 'Keep practicing to surface your strengths.'}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-caution mb-2">Focus areas</p>
            <p className="text-sm text-slate-600">
              {stats.weaknesses.length ? stats.weaknesses.join(', ') : 'No weak areas detected yet.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
