import React from 'react'

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className={`${sizes[size]} rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin`} />
    </div>
  )
}

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
)

export default Spinner
