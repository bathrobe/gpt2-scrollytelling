'use client'

interface ResidualFlowVisualProps {
  title?: string
}

export default function ResidualFlowVisual({}: ResidualFlowVisualProps) {
  
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
          <svg viewBox="0 0 600 220" className="w-full">
            <defs>
              <linearGradient id="mainFlowH" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(102, 126, 234, 0.6)" />
                <stop offset="50%" stopColor="rgba(102, 126, 234, 0.8)" />
                <stop offset="100%" stopColor="rgba(102, 126, 234, 0.6)" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Main flow pipe - horizontal */}
            <rect 
              x="50" y="110" width="500" height="40" 
              fill="url(#mainFlowH)"
              opacity="0.8"
            />
            
            {/* Animated flow particles */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={`flow-${i}`}
                cx="0"
                cy="130"
                r="3"
                fill="#64f5d0"
                opacity="0.6"
              >
                <animate
                  attributeName="cx"
                  from="-20"
                  to="570"
                  dur="3s"
                  begin={`${i * 0.6}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
            
            {/* Input label */}
            <text x="30" y="135" fill="#e0e6ed" fontSize="12" fontFamily="monospace" textAnchor="middle">
              x
            </text>
            
            {/* Attention adjustment */}
            <g>
              {/* Branch off */}
              <path 
                d="M 200 110 L 200 70"
                stroke="rgba(100, 255, 218, 0.4)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              
              {/* Attention box */}
              <rect 
                x="160" y="40" width="80" height="25" 
                rx="6"
                fill="rgba(40, 45, 70, 0.8)"
                stroke="rgba(100, 255, 218, 0.3)"
                strokeWidth="2"
              />
              <text x="200" y="57" fill="#e0e6ed" fontSize="11" fontFamily="monospace" textAnchor="middle">
                attention
              </text>
              
              {/* Small delta particles */}
              <circle cx="200" cy="70" r="2" fill="#ffc864">
                <animate
                  attributeName="cy"
                  values="70;110"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Plus sign */}
              <circle cx="200" cy="130" r="10" 
                fill="rgba(100, 255, 218, 0.1)" 
                stroke="rgba(100, 255, 218, 0.6)" 
                strokeWidth="1.5"
              />
              <text x="200" y="135" fill="#64f5d0" fontSize="12" fontFamily="monospace" textAnchor="middle">
                +
              </text>
            </g>
            
            {/* FFN adjustment */}
            <g>
              {/* Branch off */}
              <path 
                d="M 400 110 L 400 70"
                stroke="rgba(100, 255, 218, 0.4)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              
              {/* FFN box */}
              <rect 
                x="360" y="40" width="80" height="25" 
                rx="6"
                fill="rgba(40, 45, 70, 0.8)"
                stroke="rgba(100, 255, 218, 0.3)"
                strokeWidth="2"
              />
              <text x="400" y="57" fill="#e0e6ed" fontSize="11" fontFamily="monospace" textAnchor="middle">
                FFN
              </text>
              
              {/* Small delta particles */}
              <circle cx="400" cy="70" r="2" fill="#ff6b6b">
                <animate
                  attributeName="cy"
                  values="70;110"
                  dur="2s"
                  begin="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2s"
                  begin="1s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Plus sign */}
              <circle cx="400" cy="130" r="10" 
                fill="rgba(100, 255, 218, 0.1)" 
                stroke="rgba(100, 255, 218, 0.6)" 
                strokeWidth="1.5"
              />
              <text x="400" y="135" fill="#64f5d0" fontSize="12" fontFamily="monospace" textAnchor="middle">
                +
              </text>
            </g>
            
            {/* Output label */}
            <text x="570" y="135" fill="#e0e6ed" fontSize="12" fontFamily="monospace" textAnchor="middle">
              x'
            </text>
            
            {/* Labels for clarity */}
            <text x="300" y="180" fill="rgba(224, 230, 237, 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">
              main flow (preserved)
            </text>
          </svg>
          
          {/* Info panel */}
          <div className="mt-4 p-3 rounded-lg" 
               style={{
                 borderTop: '1px solid rgba(100, 255, 218, 0.2)',
                 background: 'rgba(10, 15, 30, 0.9)'
               }}>
            <div className="text-xs font-mono" style={{ color: 'rgba(224, 230, 237, 0.8)' }}>
              <span style={{ color: '#64f5d0' }}>x = x + attn(x)</span> then <span style={{ color: '#64f5d0' }}>x = x + ffn(x)</span>
              <br />
              Each layer adds small adjustments to the existing representation
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}