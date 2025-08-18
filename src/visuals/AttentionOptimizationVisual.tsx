'use client'

interface AttentionOptimizationVisualProps {
  title?: string
}

export default function AttentionOptimizationVisual({}: AttentionOptimizationVisualProps) {
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <div 
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)',
            border: '1px solid rgba(100, 255, 218, 0.15)'
          }}
        >
          <svg viewBox="0 0 700 280" className="w-full">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Stage 1: Mega Tensor */}
            <g>
              {/* Input */}
              <rect 
                x="20" y="100" width="60" height="40" 
                rx="6"
                fill="rgba(40, 45, 70, 0.8)"
                stroke="rgba(102, 126, 234, 0.6)"
                strokeWidth="2"
              />
              <text x="50" y="125" fill="#e0e6ed" fontSize="11" fontFamily="monospace" textAnchor="middle">
                x
              </text>
              <text x="50" y="155" fill="rgba(224, 230, 237, 0.5)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                (B,T,C)
              </text>
              
              {/* Arrow */}
              <path 
                d="M 85 120 L 115 120"
                stroke="rgba(100, 255, 218, 0.6)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              
              {/* Mega tensor computation */}
              <rect 
                x="120" y="85" width="100" height="70" 
                rx="8"
                fill="rgba(102, 126, 234, 0.2)"
                stroke="rgba(102, 126, 234, 0.8)"
                strokeWidth="2"
              />
              <text x="170" y="105" fill="#667eea" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                c_attn
              </text>
              <text x="170" y="122" fill="#e0e6ed" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Linear
              </text>
              <text x="170" y="138" fill="rgba(224, 230, 237, 0.6)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                C → 3×C
              </text>
              
              {/* Optimization note */}
              <text x="170" y="175" fill="#ffc864" fontSize="9" fontFamily="monospace" textAnchor="middle">
                1 matmul not 3!
              </text>
            </g>
            
            {/* Stage 2: Split and Reshape */}
            <g>
              {/* Arrow */}
              <path 
                d="M 225 120 L 255 120"
                stroke="rgba(100, 255, 218, 0.6)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              
              {/* QKV split */}
              <g>
                {/* Q */}
                <rect 
                  x="260" y="50" width="50" height="30" 
                  rx="4"
                  fill="rgba(40, 45, 70, 0.8)"
                  stroke="rgba(100, 255, 218, 0.4)"
                  strokeWidth="1.5"
                />
                <text x="285" y="69" fill="#64f5d0" fontSize="11" fontFamily="monospace" textAnchor="middle">
                  Q
                </text>
                
                {/* K */}
                <rect 
                  x="260" y="95" width="50" height="30" 
                  rx="4"
                  fill="rgba(40, 45, 70, 0.8)"
                  stroke="rgba(100, 255, 218, 0.4)"
                  strokeWidth="1.5"
                />
                <text x="285" y="114" fill="#64f5d0" fontSize="11" fontFamily="monospace" textAnchor="middle">
                  K
                </text>
                
                {/* V */}
                <rect 
                  x="260" y="140" width="50" height="30" 
                  rx="4"
                  fill="rgba(40, 45, 70, 0.8)"
                  stroke="rgba(100, 255, 218, 0.4)"
                  strokeWidth="1.5"
                />
                <text x="285" y="159" fill="#64f5d0" fontSize="11" fontFamily="monospace" textAnchor="middle">
                  V
                </text>
              </g>
              
              {/* Reshape operations */}
              <g>
                <text x="350" y="45" fill="#ffc864" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  .view()
                </text>
                <text x="350" y="58" fill="#ffc864" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  .transpose()
                </text>
                
                {/* Arrows from QKV to reshape */}
                <path d="M 315 65 L 380 65" stroke="rgba(255, 200, 100, 0.4)" strokeWidth="1" strokeDasharray="3,3"/>
                <path d="M 315 110 L 380 110" stroke="rgba(255, 200, 100, 0.4)" strokeWidth="1" strokeDasharray="3,3"/>
                <path d="M 315 155 L 380 155" stroke="rgba(255, 200, 100, 0.4)" strokeWidth="1" strokeDasharray="3,3"/>
              </g>
              
              {/* Dimension labels */}
              <text x="350" y="195" fill="rgba(224, 230, 237, 0.5)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                (B,T,C) → (B,T,nh,hs)
              </text>
              <text x="350" y="208" fill="rgba(224, 230, 237, 0.5)" fontSize="9" fontFamily="monospace" textAnchor="middle">
                → (B,nh,T,hs)
              </text>
            </g>
            
            {/* Stage 3: Parallel Heads */}
            <g>
              {/* Multiple attention heads */}
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect 
                    x={430 + i * 70} y={80 + i * 25} width="60" height="35"
                    rx="6"
                    fill="rgba(100, 255, 218, 0.1)"
                    stroke="rgba(100, 255, 218, 0.6)"
                    strokeWidth="2"
                    opacity={1 - i * 0.2}
                  />
                  <text 
                    x={460 + i * 70} y={102 + i * 25} 
                    fill="#64f5d0" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    textAnchor="middle"
                    opacity={1 - i * 0.2}
                  >
                    head {i}
                  </text>
                </g>
              ))}
              
              {/* Parallel indicator */}
              <text x="510" y="180" fill="#64f5d0" fontSize="10" fontFamily="monospace" textAnchor="middle">
                parallel!
              </text>
            </g>
            
            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3">
                <polygon points="0 0, 10 3, 0 6" fill="rgba(100, 255, 218, 0.6)" />
              </marker>
            </defs>
          </svg>
          
          {/* Info panel */}
          <div className="mt-4 p-3 rounded-lg" 
               style={{
                 borderTop: '1px solid rgba(100, 255, 218, 0.2)',
                 background: 'rgba(10, 15, 30, 0.9)'
               }}>
            <div className="text-xs font-mono" style={{ color: 'rgba(224, 230, 237, 0.8)' }}>
              <span style={{ color: '#667eea' }}>Line 38:</span> Compute Q,K,V together • 
              <span style={{ color: '#ffc864' }}> Lines 59-61:</span> Reshape for parallel heads
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}