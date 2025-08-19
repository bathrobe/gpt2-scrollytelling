import React, { useState, useEffect } from 'react';

const GPTArchitectureVisual = () => {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getInfoText = () => {
    switch(hoveredComponent) {
      case 'tokens':
        return 'Input tokens: "Hi, my name is" → [15, 234, 89, 445]';
      case 'wte':
        return 'Token Embeddings: Each token ID → 768-dim vector via lookup table (50,257 × 768)';
      case 'wpe':
        return 'Position Embeddings: Position 0,1,2,3... → 768-dim vectors, added to token embeddings';
      case 'blocks':
        return 'Transformer Blocks (×12): Each block has attention (tokens talk) + FFN (tokens think)';
      case 'ln_f':
        return 'Final LayerNorm: Normalizes hidden states before predicting next token';
      case 'lm_head':
        return 'LM Head: Projects 768 dims → 50,257 vocabulary (shares weights with token embeddings!)';
      case 'output':
        return 'Output: Probability distribution over all possible next tokens';
      default:
        return 'Hover over components to explore the GPT architecture';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      position: 'relative',
      fontFamily: "'SF Mono', monospace",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Diagram Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        padding: '20px'
      }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Flow Lines */}
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(100, 255, 218, 0.6)" />
              <stop offset="100%" stopColor="rgba(100, 255, 218, 0.1)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Input Tokens */}
          <g 
            onMouseEnter={() => setHoveredComponent('tokens')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="50" y="350" width="200" height="40" rx="8" 
                  fill={hoveredComponent === 'tokens' ? 'rgba(100, 255, 218, 0.2)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(100, 255, 218, 0.4)" strokeWidth="2"/>
            <text x="150" y="375" textAnchor="middle" fill="#e0e6ed" fontSize="14">
              Hi, my name is
            </text>
          </g>

          {/* Token Embeddings */}
          <g 
            onMouseEnter={() => setHoveredComponent('wte')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="50" y="280" width="90" height="50" rx="8"
                  fill={hoveredComponent === 'wte' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(102, 126, 234, 0.6)" strokeWidth="2"/>
            <text x="95" y="300" textAnchor="middle" fill="#e0e6ed" fontSize="12">wte</text>
            <text x="95" y="315" textAnchor="middle" fill="#999" fontSize="10">50k→768</text>
          </g>

          {/* Position Embeddings */}
          <g 
            onMouseEnter={() => setHoveredComponent('wpe')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="160" y="280" width="90" height="50" rx="8"
                  fill={hoveredComponent === 'wpe' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(102, 126, 234, 0.6)" strokeWidth="2"/>
            <text x="205" y="300" textAnchor="middle" fill="#e0e6ed" fontSize="12">wpe</text>
            <text x="205" y="315" textAnchor="middle" fill="#999" fontSize="10">1024→768</text>
          </g>

          {/* Addition Circle */}
          <circle cx="150" cy="240" r="15" 
                  fill="rgba(255, 200, 100, 0.2)" 
                  stroke="rgba(255, 200, 100, 0.6)" 
                  strokeWidth="2"/>
          <text x="150" y="245" textAnchor="middle" fill="#ffc864" fontSize="20">+</text>

          {/* Transformer Blocks */}
          <g 
            onMouseEnter={() => setHoveredComponent('blocks')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect 
                  x="300" 
                  y={180 - i * 30} 
                  width="200" 
                  height="25" 
                  rx="6"
                  fill={hoveredComponent === 'blocks' ? 'rgba(100, 255, 218, 0.2)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(100, 255, 218, 0.4)" 
                  strokeWidth="1.5"
                  opacity={i === 0 ? 1 : 0.6}
                />
                <text x="400" y={197 - i * 30} textAnchor="middle" fill="#e0e6ed" fontSize="11">
                  {i === 0 ? 'Block 0: Attn → FFN' : i === 1 ? 'Block 1: Attn → FFN' : '...'}
                </text>
              </g>
            ))}
            <text x="400" y={110} textAnchor="middle" fill="#999" fontSize="10">× 12 layers</text>
          </g>

          {/* Residual Path */}
          <path 
            d="M 150 225 Q 280 225 280 180 L 520 180 Q 540 180 540 160"
            fill="none" 
            stroke="rgba(255, 107, 107, 0.3)" 
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text x="380" y="215" fill="rgba(255, 107, 107, 0.5)" fontSize="10">residual stream</text>

          {/* Layer Norm */}
          <g 
            onMouseEnter={() => setHoveredComponent('ln_f')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="490" y="140" width="100" height="30" rx="6"
                  fill={hoveredComponent === 'ln_f' ? 'rgba(255, 200, 100, 0.3)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(255, 200, 100, 0.6)" strokeWidth="2"/>
            <text x="540" y="159" textAnchor="middle" fill="#e0e6ed" fontSize="12">ln_f</text>
          </g>

          {/* LM Head */}
          <g 
            onMouseEnter={() => setHoveredComponent('lm_head')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="620" y="80" width="120" height="40" rx="8"
                  fill={hoveredComponent === 'lm_head' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(255, 107, 107, 0.6)" strokeWidth="2"/>
            <text x="680" y="98" textAnchor="middle" fill="#e0e6ed" fontSize="12">lm_head</text>
            <text x="680" y="112" textAnchor="middle" fill="#999" fontSize="10">768→50k</text>
          </g>

          {/* Weight Tying Curve */}
          <path 
            d="M 95 280 Q 95 50 680 50 Q 680 80 680 80"
            fill="none" 
            stroke="rgba(255, 107, 107, 0.4)" 
            strokeWidth="2"
            strokeDasharray="8,4"
            filter="url(#glow)"
          />
          <text x="400" y="45" textAnchor="middle" fill="rgba(255, 107, 107, 0.7)" fontSize="11">
            weight sharing (wte.T = lm_head)
          </text>

          {/* Output */}
          <g 
            onMouseEnter={() => setHoveredComponent('output')}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect x="620" y="20" width="120" height="30" rx="6"
                  fill={hoveredComponent === 'output' ? 'rgba(100, 255, 218, 0.3)' : 'rgba(40, 45, 70, 0.8)'}
                  stroke="rgba(100, 255, 218, 0.6)" strokeWidth="2"/>
            <text x="680" y="40" textAnchor="middle" fill="#64f5d0" fontSize="12">
              P(next token)
            </text>
          </g>

          {/* Flow Arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(100, 255, 218, 0.6)" />
            </marker>
          </defs>
          
          <path d="M 150 350 L 150 330" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 95 280 L 95 255 L 135 255" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 205 280 L 205 255 L 165 255" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 150 225 L 150 200 L 300 200" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 500 180 L 540 180 L 540 170" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 540 140 L 540 120 L 620 120 L 620 100" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 680 80 L 680 50" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />

          {/* Animated Data Flow Particles */}
          {[0, 33, 66].map(offset => (
            <circle key={offset} r="3" fill="rgba(100, 255, 218, 0.8)" filter="url(#glow)">
              <animateMotion 
                dur="3s" 
                repeatCount="indefinite"
                begin={`${offset / 33}s`}
              >
                <mpath href="#dataPath" />
              </animateMotion>
            </circle>
          ))}
          <path id="dataPath" d="M 150 370 L 150 255 L 400 180 L 540 155 L 680 100 L 680 35" 
                fill="none" stroke="none" />
        </svg>
      </div>

      {/* Info Panel */}
      <div style={{
        borderTop: '1px solid rgba(100, 255, 218, 0.2)',
        padding: '12px 20px',
        background: 'rgba(10, 15, 30, 0.9)',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          color: 'rgba(224, 230, 237, 0.8)',
          lineHeight: '1.4'
        }}>
          {getInfoText()}
        </div>
      </div>
    </div>
  );
};

export default GPTArchitectureVisual;