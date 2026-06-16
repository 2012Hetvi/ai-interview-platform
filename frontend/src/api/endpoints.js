import api from './client'

// ---------- AUTH ----------
export const registerUser = (data) => api.post('/api/auth/register', data)
export const loginUser = (data) => api.post('/api/auth/login', data)
export const getMe = () => api.get('/api/auth/me')

// ---------- MOCK INTERVIEW ----------
export const startInterview = (data) => api.post('/api/interview/start', data)
export const submitInterviewAnswer = (data) => api.post('/api/interview/answer', data)
export const nextInterviewQuestion = (interviewId) =>
  api.post(`/api/interview/${interviewId}/next-question`)
export const completeInterview = (interviewId) =>
  api.post(`/api/interview/${interviewId}/complete`)
export const getInterviewHistory = () => api.get('/api/interview/history')
export const getInterview = (id) => api.get(`/api/interview/${id}`)

// ---------- CODING ----------
export const getCodingQuestions = (params) => api.get('/api/coding/questions', { params })
export const getCodingQuestion = (id) => api.get(`/api/coding/questions/${id}`)
export const submitCode = (data) => api.post('/api/coding/submit', data)
export const getCodingSubmissions = () => api.get('/api/coding/submissions')

// ---------- BEHAVIORAL ----------
export const getBehavioralQuestions = () => api.get('/api/behavioral/questions')
export const submitBehavioralResponse = (data) => api.post('/api/behavioral/submit', data)
export const getBehavioralResponses = () => api.get('/api/behavioral/responses')

// ---------- APTITUDE ----------
export const getAptitudeQuestions = (params) => api.get('/api/aptitude/questions', { params })
export const submitAptitudeAttempt = (data) => api.post('/api/aptitude/submit', data)
export const getAptitudeAttempts = () => api.get('/api/aptitude/attempts')

// ---------- ANALYTICS ----------
export const getDashboardStats = () => api.get('/api/analytics/dashboard')
