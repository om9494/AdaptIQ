import React from 'react'

const variants = {
  brand:   'badge-brand',
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  slate:   'badge-slate',
}

const Badge = ({ children, variant = 'slate', className = '' }) => (
  <span className={`${variants[variant] || variants.slate} ${className}`}>
    {children}
  </span>
)

export default Badge
