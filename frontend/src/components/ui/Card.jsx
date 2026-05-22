import React from 'react'

const Card = ({ children, className = '', hover = false, onClick }) => {
  const base = hover ? 'card-hover' : 'card'
  return (
    <div
      className={`${base} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

export default Card
