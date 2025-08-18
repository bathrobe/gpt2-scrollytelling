'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SpeedupVisualizationProps {
  data?: string
}

export default function SpeedupVisualization({ data }: SpeedupVisualizationProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const parseData = () => {
      const cpuBaseline = 847.12
      
      const results = [
        {
          name: 'CPU',
          tokensPerSec: 823.5,
          speedup: 1,
          description: 'Baseline CPU',
          time: '~20s/step',
          color: '#4a5568'
        },
        {
          name: 'GPU F32',
          tokensPerSec: 21468.5,
          speedup: 25.3,
          description: 'Full 32-bit precision',
          time: '~763ms',
          color: '#38b2ac'
        },
        {
          name: 'TF32',
          tokensPerSec: 71145.6,
          speedup: 84.0,
          description: 'Tensor Float 32',
          time: '~230ms',
          color: '#48bb78'
        },
        {
          name: 'BF16',
          tokensPerSec: 115090.2,
          speedup: 135.9,
          description: 'Brain Float 16',
          time: '~142ms',
          color: '#4fd1c5'
        },
        {
          name: 'Compiled',
          tokensPerSec: 182838.0,
          speedup: 215.9,
          description: 'torch.compile',
          time: '~90ms',
          color: '#f6ad55'
        }
      ]
      
      return results
    }
    
    if (data) {
      setChartData(parseData())
    }
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div style={{
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1px solid rgba(100, 255, 218, 0.3)',
          borderRadius: '6px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '11px'
        }}>
          <div style={{ color: '#64f5d0', fontWeight: 'bold', marginBottom: '4px' }}>
            {data.name}
          </div>
          <div style={{ color: '#e0e6ed' }}>
            {data.description}
          </div>
          <div style={{ color: '#e0e6ed', marginTop: '4px' }}>
            {Math.round(data.tokensPerSec).toLocaleString()} tokens/sec
          </div>
          <div style={{ color: '#64f5d0', fontWeight: 'bold' }}>
            {data.speedup.toFixed(1)}x speedup
          </div>
          <div style={{ color: '#999', fontSize: '10px' }}>
            {data.time}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      width: '100%',
      height: '400px',
      maxHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)',
      borderRadius: '12px',
      padding: '20px',
      fontFamily: 'monospace',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        color: '#e0e6ed',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        margin: '0 0 15px 0',
        textTransform: 'uppercase'
      }}>
        Training Speedup Progression
      </h2>

      <div style={{ position: 'relative', flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 5, right: 20, left: 60, bottom: 30 }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#e0e6ed', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(100, 255, 218, 0.2)' }}
            />
            <YAxis
              scale="log"
              domain={[100, 1000000]}
              ticks={[100, 1000, 10000, 100000, 1000000]}
              tickFormatter={(value) => {
                if (value >= 1000000) return '1M'
                if (value >= 1000) return `${value/1000}k`
                return value.toString()
              }}
              tick={{ fill: '#e0e6ed', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(100, 255, 218, 0.2)' }}
              label={{ 
                value: 'Tokens/sec (log scale)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#e0e6ed', fontSize: 10, textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 255, 218, 0.1)' }} />
            <Bar dataKey="tokensPerSec">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '10px',
        fontSize: '10px',
        color: 'rgba(224, 230, 237, 0.6)'
      }}>
        <span>⚡ Each optimization compounds</span>
        <span style={{ color: '#f6ad55' }}>
          ★ torch.compile = "heavy artillery"
        </span>
      </div>
    </div>
  )
}