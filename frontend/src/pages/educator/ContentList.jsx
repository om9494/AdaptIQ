import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2, FiYoutube, FiFile, FiVideo, FiFileText, FiVolume2, FiBookOpen, FiZap, FiEdit2 } from 'react-icons/fi'
import { getCourseContent, deleteContent, getCourse } from '../../api/educator'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DifficultyBadge from '../../components/ui/DifficultyBadge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast.jsx'

const typeIconMap = { video: FiVideo, audio: FiVolume2, pdf: FiFileText, text: FiBookOpen, interactive: FiZap }
const typeBgMap = {
  video:       'bg-indigo-100 dark:bg-indigo-900/30',
  audio:       'bg-violet-100 dark:bg-violet-900/30',
  pdf:         'bg-amber-100 dark:bg-amber-900/30',
  text:        'bg-green-100 dark:bg-green-900/30',
  interactive: 'bg-slate-100 dark:bg-slate-700',
}
const typeIconColorMap = {
  video:       'text-indigo-600 dark:text-indigo-400',
  audio:       'text-violet-600 dark:text-violet-400',
  pdf:         'text-amber-600 dark:text-amber-400',
  text:        'text-green-600 dark:text-green-400',
  interactive: 'text-slate-500 dark:text-slate-400',
}

const ContentList = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [contents, setContents] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    const [contentRes, courseRes] = await Promise.all([getCourseContent(id), getCourse(id)])
    setContents(contentRes.data.data)
    setCourse(courseRes.data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteContent(deleteTarget)
      toast.success('Content deleted')
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">Course Content</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{course?.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{contents.length} lessons</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/educator/courses/${id}/edit`)}>
            <FiEdit2 size={14} /> Edit Course
          </Button>
          <Button onClick={() => navigate(`/educator/courses/${id}/upload`)}>
            <FiPlus size={16} /> Add Content
          </Button>
        </div>
      </div>

      {/* Content grid */}
      {contents.length === 0 ? (
        <Card className="p-12 text-center">
          <FiBookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">No content yet</p>
          <p className="text-slate-400 text-sm mt-1">Add videos, PDFs, or text lessons to your course.</p>
          <Button className="mt-4" onClick={() => navigate(`/educator/courses/${id}/upload`)}>
            <FiPlus size={16} /> Add First Lesson
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {contents.map((content, index) => {
            const Icon = typeIconMap[content.content_type] || FiBookOpen
            const bg = typeBgMap[content.content_type] || typeBgMap.text
            const ic = typeIconColorMap[content.content_type] || typeIconColorMap.text
            return (
              <Card key={content.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Index */}
                  <span className="text-sm font-mono text-slate-400 w-6 shrink-0">{String(index + 1).padStart(2, '0')}</span>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={ic} size={16} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{content.title}</p>
                      {content.is_youtube && <Badge variant="danger"><FiYoutube size={10} /> YouTube</Badge>}
                      {content.has_uploaded_file && <Badge variant="success"><FiFile size={10} /> File</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 capitalize">{content.content_type}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{Math.round((content.duration_seconds || 0) / 60)} min</span>
                    </div>
                    {content.concept_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {content.concept_tags.slice(0, 4).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400">
                            {tag.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {content.concept_tags.length > 4 && (
                          <span className="text-xs text-slate-400">+{content.concept_tags.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Difficulty + Delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <DifficultyBadge level={content.difficulty_score > 0.7 ? 'Hard' : content.difficulty_score > 0.4 ? 'Medium' : 'Easy'} />
                    <button
                      onClick={() => setDeleteTarget(content.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} title="Delete Content" onClose={() => setDeleteTarget(null)}>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Are you sure you want to delete this content? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default ContentList
