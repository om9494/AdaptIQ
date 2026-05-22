import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiBookOpen, FiImage, FiTag, FiArrowRight, FiSave } from 'react-icons/fi'
import { createCourse, updateCourse, getCourse } from '../../api/educator'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../hooks/useToast.jsx'

const SUBJECTS = ['Programming', 'Mathematics', 'Science', 'Design', 'Business', 'Language', 'Data Science', 'AI/ML', 'Other']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert']

const CourseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = !!id

  const [form, setForm] = useState({
    title: '', description: '', subject: 'Programming',
    difficulty_level: 'Easy', thumbnail_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCourse(id).then(r => setForm(r.data.data)).finally(() => setLoading(false))
  }, [id])

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (next = 'stay') => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    setSaving(true)
    try {
      let courseId = id
      if (id) {
        await updateCourse(id, form)
        toast.success('Course updated!')
      } else {
        const res = await createCourse(form)
        courseId = res.data.data.id
        toast.success('Course created!')
      }
      if (next === 'content') navigate(`/educator/courses/${courseId}/content`)
      else if (next === 'dashboard') navigate('/educator/dashboard')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center p-12"><div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" /></div>

  return (
    <div className="max-w-3xl space-y-6 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isEdit ? 'Update your course details.' : 'Set up your course. You can add content after saving.'}
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="label">Course Title *</label>
          <input name="title" className="input" placeholder="e.g. Python for Beginners" value={form.title} onChange={onChange} />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea
            name="description"
            className="input resize-none"
            rows={5}
            placeholder="Describe what students will learn, who this course is for, and what makes it unique..."
            value={form.description}
            onChange={onChange}
          />
        </div>

        {/* Subject + Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            <select name="subject" className="input" value={form.subject} onChange={onChange}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty Level</label>
            <div className="flex gap-2 flex-wrap mt-1.5">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty_level: d })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.difficulty_level === d
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="label">Thumbnail URL</label>
          <div className="relative">
            <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="thumbnail_url"
              className="input pl-10"
              placeholder="https://images.unsplash.com/..."
              value={form.thumbnail_url}
              onChange={onChange}
            />
          </div>
          {form.thumbnail_url && (
            <img src={form.thumbnail_url} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => handleSave('content')} loading={saving} size="lg">
          {isEdit ? 'Save & Manage Content' : 'Create & Add Content'} <FiArrowRight size={16} />
        </Button>
        <Button variant="secondary" onClick={() => handleSave('dashboard')} loading={saving} size="lg">
          <FiSave size={16} /> Save Course
        </Button>
        <Button variant="ghost" onClick={() => navigate('/educator/dashboard')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default CourseForm
