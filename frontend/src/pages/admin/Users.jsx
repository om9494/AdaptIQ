import React, { useEffect, useState } from 'react'
import { FiSearch, FiUserCheck, FiUserX, FiShield, FiBook, FiChevronDown } from 'react-icons/fi'
import { listUsers, toggleUserStatus, changeUserRole, listCourses, assignCourseToStudents } from '../../api/admin'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast.jsx'

const roleColors = { student: 'brand', educator: 'violet', admin: 'slate' }

const AdminUsers = () => {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [assignModal, setAssignModal] = useState(null) // { userId, userName }
  const [selectedCourse, setSelectedCourse] = useState('')
  const [assigning, setAssigning] = useState(false)

  const load = async () => {
    setLoading(true)
    const [usersRes, coursesRes] = await Promise.all([listUsers(roleFilter), listCourses()])
    setUsers(usersRes.data.data)
    setCourses(coursesRes.data.data.filter(c => c.is_published))
    setLoading(false)
  }

  useEffect(() => { load() }, [roleFilter])

  const handleDeactivate = async (userId) => {
    await toggleUserStatus(userId)
    toast.success('User status updated')
    load()
  }

  const handleRoleChange = async (userId, role) => {
    await changeUserRole(userId, { role })
    toast.success('Role updated')
    load()
  }

  const handleAssign = async () => {
    if (!selectedCourse) { toast.error('Select a course'); return }
    setAssigning(true)
    try {
      await assignCourseToStudents({ course_id: selectedCourse, student_id: assignModal.userId })
      toast.success('Course assigned!')
      setAssignModal(null)
      setSelectedCourse('')
      load()
    } finally {
      setAssigning(false)
    }
  }

  if (loading) return <PageSpinner />

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="input pl-10" placeholder="Search users..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'student', 'educator', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                roleFilter === r ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Courses</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <option value="student">Student</option>
                      <option value="educator">Educator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'student' && (
                      <div className="flex flex-wrap gap-1">
                        {(user.assigned_courses || []).slice(0, 2).map(c => (
                          <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                            {c.title.slice(0, 20)}...
                          </span>
                        ))}
                        {(user.assigned_courses || []).length === 0 && (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'student' && (
                        <Button size="sm" variant="secondary" onClick={() => setAssignModal({ userId: user.id, userName: user.name })}>
                          <FiBook size={12} /> Assign
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={user.is_active ? 'secondary' : 'primary'}
                        onClick={() => handleDeactivate(user.id)}
                      >
                        {user.is_active ? <FiUserX size={12} /> : <FiUserCheck size={12} />}
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">No users found</div>
          )}
        </div>
      </Card>

      {/* Assign course modal */}
      <Modal open={!!assignModal} title={`Assign Course to ${assignModal?.userName}`} onClose={() => setAssignModal(null)}>
        <div className="space-y-4">
          <div>
            <label className="label">Select Course</label>
            <select className="input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="">Choose a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAssign} loading={assigning}>Assign Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers
