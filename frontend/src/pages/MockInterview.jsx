import { useState } from 'react'
import { Mic, Send, CheckCircle2 } from 'lucide-react'
import {
  startInterview, submitInterviewAnswer, nextInterviewQuestion, completeInterview,
} from '../api/endpoints'
import { Card, ScoreBadge, PrimaryButton, Spinner } from '../components/ui'

const ROLES = ['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Product Manager']

export default function MockInterview() {
  const [stage, setStage] = useState('setup')   // setup | active | summary
  const [role, setRole] = useState(ROLES[0])
  const [interview, setInterview] = useState(null)
  const [currentQA, setCurrentQA] = useState(null)
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await startInterview({ role, mode: 'text' })
      setInterview(res.data)
      setCurrentQA(res.data.qa_pairs[0])
      setHistory([])
      setStage('active')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const res = await submitInterviewAnswer({
        interview_id: interview.id,
        qa_id: currentQA.id,
        answer_text: answer,
      })
      setHistory((h) => [...h, res.data])
      setCurrentQA(null)
      setAnswer('')
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    setLoading(true)
    try {
      const res = await nextInterviewQuestion(interview.id)
      setCurrentQA(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const res = await completeInterview(interview.id)
      setSummary(res.data)
      setStage('summary')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'setup') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">AI Mock Interview</h1>
        <p className="text-slate-600 text-sm mb-6">
          Practice with an AI interviewer that asks role-specific questions and gives instant feedback.
        </p>
        <Card>
          <label className="block text-sm font-medium text-slate-800 mb-1">Target role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm mb-5"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <PrimaryButton onClick={handleStart} disabled={loading} className="w-full justify-center flex items-center gap-2">
            <Mic size={16} /> {loading ? 'Starting…' : 'Start Interview'}
          </PrimaryButton>
        </Card>
      </div>
    )
  }

  if (stage === 'summary') {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="font-display text-2xl font-bold text-ink">Interview Summary</h1>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Overall Score</p>
            <ScoreBadge score={summary.overall_score} />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.overall_feedback}</p>
        </Card>
        <div className="space-y-3">
          {summary.qa_pairs.filter((q) => q.answer_text).map((qa, i) => (
            <Card key={qa.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-ink">Q{i + 1}. {qa.question_text}</p>
                <ScoreBadge score={qa.score} />
              </div>
              <p className="text-sm text-slate-600 mb-2"><span className="font-medium">Your answer:</span> {qa.answer_text}</p>
              <p className="text-sm text-signal-dark bg-signal-light rounded-lg px-3 py-2">{qa.ai_feedback}</p>
            </Card>
          ))}
        </div>
        <PrimaryButton onClick={() => { setStage('setup'); setSummary(null); setInterview(null) }}>
          Start Another Interview
        </PrimaryButton>
      </div>
    )
  }

  // active stage
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Mock Interview · {role}</h1>
          <p className="text-slate-600 text-sm mt-1">Question {history.length + 1}</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleFinish} disabled={loading} className="text-sm font-medium text-signal flex items-center gap-1">
            <CheckCircle2 size={16} /> Finish &amp; get summary
          </button>
        )}
      </div>

      {history.map((qa, i) => (
        <Card key={qa.id} className="bg-slate-50">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-ink">Q{i + 1}. {qa.question_text}</p>
            <ScoreBadge score={qa.score} />
          </div>
          <p className="text-sm text-slate-600 mb-2">{qa.answer_text}</p>
          <p className="text-sm text-signal-dark bg-signal-light rounded-lg px-3 py-2">{qa.ai_feedback}</p>
        </Card>
      ))}

      {currentQA ? (
        <Card>
          <p className="text-sm font-semibold text-ink mb-3">{currentQA.question_text}</p>
          <textarea
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here…"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm resize-none"
          />
          <div className="flex justify-end mt-3">
            <PrimaryButton onClick={handleSubmitAnswer} disabled={loading || !answer.trim()} className="flex items-center gap-2">
              <Send size={15} /> {loading ? 'Evaluating…' : 'Submit Answer'}
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        !loading && (
          <PrimaryButton onClick={handleNextQuestion}>Get Next Question</PrimaryButton>
        )
      )}

      {loading && !currentQA && <Spinner label="AI is thinking…" />}
    </div>
  )
}
