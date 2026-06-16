import { useEffect, useState } from 'react'
import { Code2, Play } from 'lucide-react'
import { getCodingQuestions, submitCode } from '../api/endpoints'
import { Card, DifficultyBadge, ScoreBadge, PrimaryButton, Spinner } from '../components/ui'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c']

export default function CodingPractice() {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState('')

  useEffect(() => {
    setListLoading(true)
    getCodingQuestions(difficultyFilter ? { difficulty: difficultyFilter } : {})
      .then((res) => setQuestions(res.data))
      .finally(() => setListLoading(false))
  }, [difficultyFilter])

  const selectQuestion = (q) => {
    setSelected(q)
    setCode('')
    setResult(null)
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await submitCode({ question_id: selected.id, language, code })
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }

  if (!selected) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Coding Practice</h1>
        <p className="text-slate-600 text-sm mb-6">Solve DSA problems and get instant AI code review.</p>

        <div className="flex gap-2 mb-4">
          {['', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d || 'all'}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                difficultyFilter === d ? 'bg-signal text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {d || 'All'}
            </button>
          ))}
        </div>

        {listLoading ? <Spinner /> : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.id} className="cursor-pointer hover:border-signal transition-colors" >
                <div onClick={() => selectQuestion(q)} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink">{q.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.category}</p>
                  </div>
                  <DifficultyBadge difficulty={q.difficulty} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => setSelected(null)} className="text-sm text-signal mb-4">← Back to problems</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-ink">{selected.title}</h2>
            <DifficultyBadge difficulty={selected.difficulty} />
          </div>
          <p className="text-sm text-slate-700 mb-4 leading-relaxed">{selected.description}</p>
          {selected.sample_input && (
            <div className="bg-slate-50 rounded-xl p-3 mb-2 font-mono text-xs">
              <p className="text-slate-500 mb-1">Input</p>
              <p className="text-ink">{selected.sample_input}</p>
            </div>
          )}
          {selected.sample_output && (
            <div className="bg-slate-50 rounded-xl p-3 mb-2 font-mono text-xs">
              <p className="text-slate-500 mb-1">Output</p>
              <p className="text-ink">{selected.sample_output}</p>
            </div>
          )}
          {selected.constraints_text && (
            <p className="text-xs text-slate-400 mt-2">Constraints: {selected.constraints_text}</p>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-signal" />
                <span className="text-sm font-medium text-slate-700">Your Solution</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1"
              >
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${language} solution here…`}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal outline-none text-sm font-mono resize-none"
            />
            <div className="flex justify-end mt-3">
              <PrimaryButton onClick={handleSubmit} disabled={loading || !code.trim()} className="flex items-center gap-2">
                <Play size={15} /> {loading ? 'Evaluating…' : 'Submit & Get AI Review'}
              </PrimaryButton>
            </div>
          </Card>

          {result && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  result.verdict === 'Accepted' ? 'bg-pulse-light text-pulse'
                  : result.verdict === 'Needs Improvement' ? 'bg-caution-light text-caution'
                  : 'bg-danger-light text-danger'
                }`}>
                  {result.verdict}
                </span>
                <div className="flex gap-2">
                  <ScoreBadge score={result.correctness_score} />
                  <ScoreBadge score={result.efficiency_score} />
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.ai_feedback}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
