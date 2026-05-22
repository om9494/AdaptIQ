import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronLeft,
  FiFileText,
  FiVideo,
  FiVolume2,
  FiZap
} from 'react-icons/fi'
import { completeContent, getContent, startContent } from '../../api/student'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../hooks/useToast.jsx'

const typeIcon = {
  video: FiVideo,
  audio: FiVolume2,
  pdf: FiFileText,
  text: FiBookOpen,
  interactive: FiZap
}

const ContentViewer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [content, setContent] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionInsight, setCompletionInsight] = useState(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const init = async () => {
      try {
        const [contentRes, sessionRes] = await Promise.all([
          getContent(id),
          startContent(id)
        ])
        setContent(contentRes.data.data)
        setSessionId(sessionRes.data.data.session_id)
        setStartTime(Date.now())
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  const handleComplete = async () => {
    if (!sessionId || completing || completed) return

    setCompleting(true)
    try {
      const timeSpent = (Date.now() - startTime) / 1000
      const engagementScore = Math.min(1, Math.max(0.3, timeSpent / 600))
      const res = await completeContent(id, { session_id: sessionId, engagement_score: engagementScore })
      const payload = res.data.data

      setCompleted(true)
      setCompletionInsight(payload.ai_progress_summary || null)
      toast.success(`+10 points! ${payload.new_badges?.length ? 'Badge unlocked!' : ''}`)

      const next = payload.next_recommended_content
      if (next?.id && next.id !== id) {
        setTimeout(() => navigate(`/student/content/${next.id}`), 1700)
      }
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <PageSpinner />

  const TypeIcon = typeIcon[content.content_type] || FiBookOpen
  const progressCoachLabel = completionInsight?.llm_enabled
    ? `${completionInsight?.provider === 'gemini' ? 'Gemini' : 'AI'} Progress Coach`
    : 'Adaptive Progress Coach'

  return (
    <div className="page-atmosphere mx-auto max-w-5xl space-y-6 animate-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
      >
        <FiChevronLeft size={16} /> Back to course
      </button>

      <section className="glass-panel relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="floating-accent right-8 top-8 h-16 w-16 bg-teal-300/20" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            <TypeIcon size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="capitalize">{content.content_type}</Badge>
              {completed && <Badge variant="success"><FiCheck size={10} /> Completed</Badge>}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">{content.title}</h1>
            {content.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {content.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <Card className="overflow-hidden p-2 sm:p-3">
        {content.content_type === 'video' && content.is_youtube && (
          <div className="video-container">
            <iframe
              src={content.embed_url}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {content.content_type === 'video' && !content.is_youtube && content.playback_url && (
          <div className="video-container">
            <video controls src={content.playback_url} className="absolute inset-0 h-full w-full" />
          </div>
        )}
        {content.content_type === 'audio' && (
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
              <FiVolume2 size={32} />
            </div>
            <audio controls className="w-full max-w-md" src={content.playback_url} />
          </div>
        )}
        {content.content_type === 'pdf' && (content.playback_url || content.url) && (
          <iframe
            title="PDF viewer"
            src={content.playback_url || content.url}
            className="h-[640px] w-full rounded-[24px]"
          />
        )}
        {content.content_type === 'text' && (
          <div className="p-8">
            <div className="prose max-w-none leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300">
              {content.description || 'No content available.'}
            </div>
          </div>
        )}
        {content.content_type === 'interactive' && content.playback_url && (
          <iframe
            title="Interactive content"
            src={content.playback_url}
            className="h-[520px] w-full rounded-[24px]"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </Card>

      {content.concept_tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {content.concept_tags.map((tag) => (
            <Badge key={tag} variant="slate">{tag.replace(/_/g, ' ')}</Badge>
          ))}
        </div>
      )}

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {completed ? 'Lesson completed.' : 'Finished this lesson?'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {completed
                ? 'Nice work. Your progress has been updated and the next recommended lesson is queued.'
                : 'Mark it complete to update your mastery, streak, and next AI recommendations.'}
            </p>
          </div>
          <Button
            onClick={handleComplete}
            loading={completing}
            disabled={completed}
            variant={completed ? 'secondary' : 'primary'}
            size="lg"
          >
            {completed ? 'Completed' : 'Mark Complete'} {!completed && <FiArrowRight size={16} />}
          </Button>
        </div>
      </Card>

      {completionInsight?.summary && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={completionInsight.llm_enabled ? 'brand' : 'warning'}>
              <FiZap size={10} /> {progressCoachLabel}
            </Badge>
            <span className="text-xs text-slate-400">
              {completionInsight.llm_enabled ? completionInsight.model : 'Fallback summary'}
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{completionInsight.summary}</p>
        </Card>
      )}

      {content.related_recommendations?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="section-title">Suggested next</h3>
            <Badge variant="brand"><FiZap size={10} /> Personalized</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {content.related_recommendations.map((item) => (
              <Card key={item.id} hover className="p-4" onClick={() => navigate(`/student/content/${item.id}`)}>
                <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs capitalize text-slate-400">{item.type || item.content_type}</p>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  Open <FiArrowRight size={12} />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentViewer
