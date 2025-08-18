'use client'

import React, { useState, useEffect } from 'react'

interface GradientAccumulationVisualProps {
  miniBatches?: number
  batchSize?: number
}

export default function GradientAccumulationVisual({ 
  miniBatches = 8, 
  batchSize = 64 
}: GradientAccumulationVisualProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (isRunning && activeStep < miniBatches) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (activeStep >= miniBatches) {
      setTimeout(() => {
        setActiveStep(0)
        setIsRunning(false)
      }, 2000)
    }
  }, [activeStep, isRunning, miniBatches])

  const handleStart = () => {
    setActiveStep(0)
    setIsRunning(true)
  }

  const totalBatchSize = miniBatches * batchSize

  return (
    <div style={{
      width: '100%',
      height: '100%',
      maxHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'monospace',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <h2 style={{
        color: '#e0e6ed',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        margin: '0 0 15px 0',
        textTransform: 'uppercase'
      }}>
        Gradient Accumulation
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ color: '#e0e6ed', fontSize: '12px' }}>
          Target: {totalBatchSize.toLocaleString()} examples
        </div>
        <button
          onClick={handleStart}
          disabled={isRunning}
          style={{
            background: isRunning ? 'rgba(100, 255, 218, 0.2)' : 'rgba(100, 255, 218, 0.1)',
            border: '1px solid rgba(100, 255, 218, 0.3)',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#64f5d0',
            fontSize: '11px',
            fontFamily: 'monospace',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isRunning ? 'Running...' : 'Start'}
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        minHeight: 0
      }}>
        {Array.from({ length: miniBatches }, (_, i) => {
          const isActive = i === activeStep - 1
          const isCompleted = i < activeStep
          const isPending = i >= activeStep

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px',
                background: isActive 
                  ? 'rgba(100, 255, 218, 0.2)' 
                  : isCompleted 
                    ? 'rgba(100, 255, 218, 0.1)'
                    : 'rgba(40, 45, 70, 0.8)',
                border: isActive 
                  ? '2px solid rgba(100, 255, 218, 0.8)'
                  : '1px solid rgba(100, 255, 218, 0.15)',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isActive ? '0 0 15px rgba(100, 255, 218, 0.3)' : 'none'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: isCompleted 
                  ? 'rgba(100, 255, 218, 0.8)' 
                  : isActive
                    ? 'rgba(255, 200, 100, 0.8)'
                    : 'rgba(150, 150, 150, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: 'bold',
                color: '#0a0e27'
              }}>
                {isCompleted ? '✓' : i + 1}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: isActive ? '#ffc864' : isCompleted ? '#64f5d0' : '#e0e6ed',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Batch {i + 1}: {batchSize}
                </div>
                <div style={{
                  color: 'rgba(224, 230, 237, 0.7)',
                  fontSize: '8px'
                }}>
                  {isCompleted ? 'Done' : isActive ? 'Active' : 'Wait'}
                </div>
              </div>

              <div style={{
                width: '20px',
                height: '12px',
                background: isCompleted 
                  ? 'linear-gradient(90deg, rgba(100, 255, 218, 0.2), rgba(100, 255, 218, 0.6))'
                  : 'rgba(40, 45, 70, 0.5)',
                borderRadius: '3px',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 200, 100, 0.6), transparent)',
                    animation: 'slideRight 1s ease-in-out infinite'
                  }} />
                )}
              </div>
            </div>
          )
        })}

      </div>
      
      {activeStep >= miniBatches && (
        <div style={{
          padding: '8px',
          background: 'rgba(100, 255, 218, 0.1)',
          border: '1px solid rgba(100, 255, 218, 0.5)',
          borderRadius: '6px',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          <div style={{
            color: '#64f5d0',
            fontSize: '10px',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            🚀 OPTIMIZER STEP
          </div>
          <div style={{
            color: 'rgba(224, 230, 237, 0.8)',
            fontSize: '9px'
          }}>
            Effective: {totalBatchSize.toLocaleString()} examples
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideRight {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  )
}