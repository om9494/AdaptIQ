import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiUpload, FiLink, FiTag, FiX, FiCheck, FiVideo, FiFileText, FiVolume2, FiBookOpen, FiZap } from 'react-icons/fi'
import { extractTags, uploadContent } from '../../api/educator'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast.jsx'

const CONTENT_TYPES = [
  { value: 'video',       label: 'Video',       icon: FiVideo,    desc: 'MP4, WebM or YouTube URL' },
  { value: 'pdf',         label: 'PDF',         icon: FiFileText, desc: 'PDF documents' },
  { value: 'audio',       label: 'Audio',       icon: FiVolume2,  desc: 'MP3, WAV files' },
  { value: 'text',        label: 'Text Lesson', icon: FiBookOpen, desc: 'Written content' },
  { value: 'interactive', label: 'Interactive', icon: FiZap,      desc: 'Embedded web content' },
]

const UploadContent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [contentType, setContentType] = useState('video')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState(0.4)
  const [duration, setDuration] = useState(480)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    if (contentType === 'text' || contentType === 'pdf') {
      setExtracting(true)
      const fd = new FormData()
      fd.append('file', selected)
      fd.append('content_type', contentType)
      try {
        const res = await extractTags(fd)
        const suggested = res.data.data.suggested_tags || []
        setTags(prev => [...new Set([...prev, ...suggested])])
        toast.info(`${suggested.length} concept tags extracted!`)
      } finally {
        setExtracting(false)
      }
    }
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (!t || tags.includes(t)) return
    setTags([...tags, t])
    setTagInput('')
  }

  const handleSubmit = async () => {
    const hasSource = file || url || (contentType === 'text' && description.trim())
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!hasSource) { toast.error('Add a file, URL, or lesson text'); return }

    const fd = new FormData()
    fd.append('title', title)
    fd.append('content_type', contentType)
    fd.append('difficulty_score', difficulty)
    fd.append('description', description)
    fd.append('concept_tags', JSON.stringify(tags))
    fd.append('duration_seconds', duration)
    if (file) fd.append('file', file)
    if (url) fd.append('url', url)

    setUploading(true)
    try {
      await uploadContent(id, fd)
      toast.success('Content uploaded successfully!')
      navigate(`/educator/courses/${id}/content`)
    } finally {
      setUploading(false)
    }
  }

  const diffLabel = difficulty < 0.4 ? 'Easy' : difficulty < 0.7 ? 'Medium' : 'Hard'

  return (
    <div className="max-w-3xl space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Add Content</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload a lesson, video, PDF, or any learning resource.</p>
      </div>

      {/* Content type selector */}
      <Card className="p-5">
        <label className="label mb-3">Content Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CONTENT_TYPES.map(ct => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setContentType(ct.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                contentType === ct.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
              }`}
            >
              <ct.icon className={`mx-auto mb-1 ${contentType === ct.value ? 'text-indigo-600' : 'text-slate-400'}`} size={20} />
              <p className={`text-xs font-semibold ${contentType === ct.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>{ct.label}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">Lesson Title *</label>
          <input className="input" placeholder="e.g. Introduction to Variables" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* File upload */}
        <div>
          <label className="label">Upload File</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300'}`}>
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FiCheck className="text-green-500" size={20} />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <>
                <FiUpload className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-sm text-slate-500">Drop a file or click to browse</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
              </>
            )}
            {!file && <input type="file" className="mt-3 text-sm text-slate-500" onChange={handleFile} />}
          </div>
          {extracting && <div className="flex items-center gap-2 mt-2 text-sm text-indigo-600"><Spinner size="sm" className="p-0" /> Extracting concept tags...</div>}
        </div>

        {/* URL */}
        <div>
          <label className="label">
            {contentType === 'video' ? 'YouTube / Video URL' : 'External URL'} (optional)
          </label>
          <div className="relative">
            <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="input pl-10"
              placeholder={contentType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description / Lesson Text</label>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Describe this lesson or paste the full text content..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Difficulty + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Difficulty: <span className="text-indigo-600">{diffLabel}</span></label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={difficulty}
              onChange={e => setDifficulty(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Easy</span><span>Medium</span><span>Hard</span>
            </div>
          </div>
          <div>
            <label className="label">Duration (seconds)</label>
            <input
              type="number" min="60" step="60"
              className="input"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-slate-400 mt-1">{Math.round(duration / 60)} minutes</p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Concept Tags</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add a concept tag..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button variant="secondary" onClick={addTag} size="sm">
              <FiTag size={14} /> Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTags(tags.filter(t => t !== tag))}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  {tag.replace(/_/g, ' ')} <FiX size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} loading={uploading} size="lg">
          <FiUpload size={16} /> Upload Content
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/educator/courses/${id}/content`)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default UploadContent
