import React from 'react'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
}

const sizes = {
  sm:   'px-3 py-1.5 text-xs rounded-lg',
  md:   '',
  lg:   'px-6 py-3 text-base',
  xl:   'px-8 py-4 text-lg',
  icon: 'p-2',
}

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) => {
  const base = variants[variant] || variants.primary
  const sz   = sizes[size] || ''

  return (
    <button
      className={`${base} ${sz} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
