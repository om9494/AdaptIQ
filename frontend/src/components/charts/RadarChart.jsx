import React from 'react'
import { Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const RadarChart = ({ data }) => (
  <div className="w-full h-72">
    <ResponsiveContainer>
      <ReRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="concept" />
        <PolarRadiusAxis angle={30} domain={[0, 1]} />
        <Radar name="Mastery" dataKey="value" stroke="#1f7a8c" fill="#1f7a8c" fillOpacity={0.4} />
      </ReRadarChart>
    </ResponsiveContainer>
  </div>
)

export default RadarChart
