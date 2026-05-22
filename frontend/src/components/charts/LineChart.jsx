import React from 'react'
import { Line, LineChart as ReLineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

const LineChart = ({ data, dataKey, color }) => (
  <div className="w-full h-72">
    <ResponsiveContainer>
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color || '#ff7a59'} strokeWidth={2} />
      </ReLineChart>
    </ResponsiveContainer>
  </div>
)

export default LineChart
