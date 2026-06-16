import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { getBehavioralQuestions, submitBehavioralResponse } from '../api/endpoints'
import { Card, ScoreBadge, PrimaryButton, Spinner } from '../components/ui'

export default function Behavioral() {
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    getBehavioralQuestions()
      .then((res) => setQuestions(res.data))
      .finally(() => setListLoading(false))
  }, [])

  const current = questions[index]

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const res = await submitBehavioralResponse({ question_id: current.id, response_text: answer })
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setIndex((i) => (i + 1) % questions.length)
    setAnswer('')
    setResult(null)
  }

  if (listLoading) return <Spinner />
  if (!current) return <p className="text-slate-600 text-sm">No behavioral questions available.</p>

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Behavioral Questions</h1>
      <p className="text-slate-600 text-sm mb-6">
        Practice the STAR method — Situation, Task, Action, Result. The AI checks your structure and clarity.
      </p>

      <Card className="mb-4">
        <p className="text-xs font-medium text-signal mb-2">{current.category}</p>
        <p className="font-semibold text-ink mb-4">{current.question_text}</p>
        <textarea
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Structure your answer using Situation, Task, Action, Result…"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm resize-none"
        />
        <div className="flex justify-end mt-3">
          <PrimaryButton onClick={handleSubmit} disabled={loading || !answer.trim()} className="flex items-center gap-2">
            <Send size={15} /> {loading ? 'Evaluating…' : 'Submit Answer'}
          </PrimaryButton>
        </div>
      </Card>

      {result && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">AI Feedback</p>
            <ScoreBadge score={result.score} />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">{result.ai_feedback}</p>
        </Card>
      )}

      <PrimaryButton onClick={handleNext}>Next Question</PrimaryButton>
    </div>
  )
}
