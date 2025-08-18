'use client'

import React, { useState, useEffect } from 'react'

interface DDPVisualProps {
  numGPUs?: number
  batchSize?: number
}

export default function DDPVisual({ 
  numGPUs = 4, 
  batchSize = 64 
}: DDPVisualProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [syncPhase, setSyncPhase] = useState(false)

  useEffect(() => {
    if (isRunning) {
      if (activeStep < 3) {
        const timer = setTimeout(() => {
          setActiveStep(prev => prev + 1)
        }, 1200)
        return () => clearTimeout(timer)
      } else if (activeStep === 3) {
        setSyncPhase(true)
        const timer = setTimeout(() => {
          setActiveStep(0)
          setSyncPhase(false)
          setIsRunning(false)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [activeStep, isRunning])

  const handleStart = () => {
    setActiveStep(0)
    setSyncPhase(false)
    setIsRunning(true)
  }

  const batchPerGPU = Math.floor(batchSize / numGPUs)

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h2 style={{
          color: '#e0e6ed',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          margin: 0,
          textTransform: 'uppercase'
        }}>
          Distributed Data Parallel
        </h2>
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
          {isRunning ? 'Running...' : 'torchrun'}
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        padding: '6px 8px',
        background: 'rgba(40, 45, 70, 0.8)',
        borderRadius: '6px',
        border: '1px solid rgba(100, 255, 218, 0.15)'
      }}>
        <div style={{ color: '#e0e6ed', fontSize: '11px' }}>
          Total batch: {batchSize} → {batchPerGPU}/GPU
        </div>
        <div style={{ 
          color: syncPhase ? '#ffc864' : '#64f5d0', 
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {syncPhase ? '🔄 GRADIENT SYNC' : `WORLD_SIZE=${numGPUs}`}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        minHeight: 0
      }}>
        {Array.from({ length: numGPUs }, (_, rank) => {
          const isMaster = rank === 0
          const isActive = activeStep > 0 && activeStep <= 3
          const progress = Math.max(0, activeStep - 1) / 2

          return (
            <div
              key={rank}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isMaster 
                  ? 'rgba(255, 200, 100, 0.1)' 
                  : 'rgba(40, 45, 70, 0.8)',
                border: syncPhase 
                  ? '2px solid rgba(100, 255, 218, 0.8)'
                  : isMaster 
                    ? '2px solid rgba(255, 200, 100, 0.3)'
                    : '1px solid rgba(100, 255, 218, 0.15)',
                borderRadius: '8px',
                padding: '8px',
                transition: 'all 0.3s ease',
                transform: syncPhase ? 'scale(1.02)' : 'scale(1)',
                boxShadow: syncPhase ? '0 0 15px rgba(100, 255, 218, 0.3)' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <div style={{
                  color: isMaster ? '#ffc864' : '#64f5d0',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  RANK {rank}
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isActive 
                    ? 'rgba(100, 255, 218, 0.8)' 
                    : 'rgba(150, 150, 150, 0.3)'
                }} />
              </div>

              {isMaster && (
                <div style={{
                  color: 'rgba(255, 200, 100, 0.8)',
                  fontSize: '8px',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  MASTER PROCESS
                </div>
              )}

              <div style={{
                color: 'rgba(224, 230, 237, 0.7)',
                fontSize: '8px',
                marginBottom: '6px'
              }}>
                Batch: {batchPerGPU} examples
              </div>

              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}>
                <div style={{
                  color: 'rgba(224, 230, 237, 0.8)',
                  fontSize: '8px',
                  marginBottom: '2px'
                }}>
                  Progress:
                </div>
                
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(40, 45, 70, 0.5)',
                  borderRadius: '3px',
                  border: '1px solid rgba(100, 255, 218, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: syncPhase 
                      ? 'linear-gradient(90deg, rgba(100, 255, 218, 0.6), rgba(255, 200, 100, 0.6))'
                      : 'linear-gradient(90deg, rgba(100, 255, 218, 0.2), rgba(100, 255, 218, 0.6))',
                    transition: 'width 0.8s ease'
                  }} />
                </div>

                {isActive && !syncPhase && (
                  <div style={{
                    color: 'rgba(100, 255, 218, 0.8)',
                    fontSize: '7px',
                    marginTop: '2px'
                  }}>
                    Forward + Backward
                  </div>
                )}

                {syncPhase && (
                  <div style={{
                    color: '#ffc864',
                    fontSize: '7px',
                    marginTop: '2px',
                    fontWeight: 'bold'
                  }}>
                    Syncing gradients...
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {syncPhase && (
        <div style={{
          padding: '6px',
          background: 'rgba(100, 255, 218, 0.1)',
          border: '1px solid rgba(100, 255, 218, 0.5)',
          borderRadius: '6px',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          <div style={{
            color: '#64f5d0',
            fontSize: '9px',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            🚀 ALL_REDUCE → OPTIMIZER STEP
          </div>
          <div style={{
            color: 'rgba(224, 230, 237, 0.8)',
            fontSize: '8px'
          }}>
            Gradients averaged across {numGPUs} processes
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '6px',
        fontSize: '8px',
        color: 'rgba(224, 230, 237, 0.6)'
      }}>
        <span>⚡ Requires torchrun --nproc_per_node={numGPUs}</span>
      </div>
    </div>
  )
}