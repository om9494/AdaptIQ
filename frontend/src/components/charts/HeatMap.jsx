import React from 'react'

const HeatMap = ({ data }) => {
  return (
    <div className="grid grid-cols-10 gap-1">
      {data.map((cell, idx) => (
        <div
          key={idx}
          className="h-6 rounded"
          style={{ backgroundColor: `rgba(47, 158, 68, ${cell.value})` }}
          title={`${cell.date}: ${cell.value}`}
        />
      ))}
    </div>
  )
}

export default HeatMap
