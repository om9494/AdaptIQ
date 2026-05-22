import React from 'react'
import { Bar, BarChart as ReBarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

const BarChart = ({ data, dataKey, color }) => (
  <div className="w-full h-72">
    <ResponsiveContainer>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color || '#1f7a8c'} />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
)

export default BarChart
