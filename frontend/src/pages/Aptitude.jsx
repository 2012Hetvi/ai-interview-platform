import { useEffect, useRef, useState } from 'react'
import { Calculator, Clock } from 'lucide-react'
import { getAptitudeQuestions, submitAptitudeAttempt } from '../api/endpoints'
import { Card, PrimaryButton, Spinner } from '../components/ui'

export default function Aptitude() {
  const [stage, setStage] = useState('setup')   // setup | active | result
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})    // question_id -> 'A'|'B'|'C'|'D'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (stage === 'active') {
      timerRef.current = setInterval(() => setSecondsElapsed((s) => s + 1), 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [stage])

  const startTest = async () => {
    setLoading(true)
    try {
      const res = await getAptitudeQuestions({ limit: 10 })
      setQuestions(res.data)
      setAnswers({})
      setSecondsElapsed(0)
      setStage('active')
    } finally {
      setLoading(false)
    }
  }

  const selectOption = (questionId, option) => {
    setAnswers((a) => ({ ...a, [questionId]: option }))
  }

  const handleSubmit = async () => {
    clearInterval(timerRef.current)
    setLoading(true)
    try {
      const payload = {
        answers: questions.map((q) => ({ question_id: q.id, selected_option: answers[q.id] || null })),
        time_taken_secs: secondsElapsed,
      }
      const res = await submitAptitudeAttempt(payload)
      setResult(res.data)
      setStage('result')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (stage === 'setup') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Aptitude Test</h1>
        <p className="text-slate-600 text-sm mb-6">
          10 quantitative, logical & verbal questions — common in placement screening rounds.
        </p>
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="text-signal" size={22} />
            <p className="text-sm text-slate-700">10 questions · no fixed time limit, but your time is tracked.</p>
          </div>
          <PrimaryButton onClick={startTest} disabled={loading} className="w-full justify-center">
            {loading ? 'Preparing…' : 'Start Test'}
          </PrimaryButton>
        </Card>
      </div>
    )
  }

  if (stage === 'result') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink mb-4">Test Result</h1>
        <Card className="text-center py-10">
          <p className="font-display text-5xl font-bold text-signal mb-2">{result.score_percent}%</p>
          <p className="text-slate-600 text-sm">
            {result.correct_answers} / {result.total_questions} correct · {formatTime(result.time_taken_secs)} taken
          </p>
        </Card>
        <PrimaryButton onClick={() => setStage('setup')} className="mt-6">Take Another Test</PrimaryButton>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Aptitude Test</h1>
        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-mono">
          <Clock size={15} /> {formatTime(secondsElapsed)}
        </div>
      </div>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <p className="text-xs font-medium text-signal mb-1">{q.category} · {q.difficulty}</p>
            <p className="font-semibold text-ink mb-3">{i + 1}. {q.question_text}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]].map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => selectOption(q.id, key)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                    answers[q.id] === key
                      ? 'border-signal bg-signal-light text-signal-dark'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium mr-1">{key}.</span> {text}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Test'}
        </PrimaryButton>
      </div>
    </div>
  )
}
