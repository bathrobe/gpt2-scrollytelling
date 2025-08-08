"use client"

import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodePaneProps {
  codePane: {
    filePath: string
    highlight: string
  }
  codeContent: string
  highlightRange: [number, number]
}

// Helper function to check if a line is in the highlight range
const isLineInRange = (lineNumber: number, range: [number, number]): boolean => {
  const [start, end] = range
  return lineNumber >= start && lineNumber <= end
}

// Helper function to create line props for highlighting
const createLineProps = (lineNumber: number, range: [number, number]) => {
  if (isLineInRange(lineNumber, range)) {
    return {
      style: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue highlight
        borderLeft: '3px solid rgb(59, 130, 246)',
        paddingLeft: '8px',
        marginLeft: '-8px'
      }
    }
  }
  // Return transparent background for non-highlighted lines to override theme
  return {
    style: {
      backgroundColor: 'transparent'
    }
  }
}

export default function CodePane({ codePane, codeContent, highlightRange }: CodePaneProps) {
  const [isVisible, setIsVisible] = useState(false)
  const highlightRef = useRef<HTMLDivElement>(null)
  
  // Debug logging
  console.log('CodePane received highlightRange:', highlightRange)
  console.log('CodePane received codePane:', codePane)

  // Cross-fade transition when codePane changes
  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [codePane.filePath])

  // Auto-scroll to highlighted lines when range changes
  useEffect(() => {
    if (highlightRef.current && highlightRange[0] >= 0) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightRange])

  return (
    <div 
      key={codePane.filePath}
      className={`transition-opacity duration-300 h-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="h-full bg-gray-950 rounded-lg overflow-auto">
        <SyntaxHighlighter
          language="python"
          style={nightOwl}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const inRange = isLineInRange(lineNumber, highlightRange)
            console.log(`Line ${lineNumber}, Range: [${highlightRange[0]}, ${highlightRange[1]}], InRange: ${inRange}`)
            const props = createLineProps(lineNumber, highlightRange)
            // Add ref to first highlighted line for auto-scroll
            if (lineNumber === highlightRange[0]) {
              return {
                ...props,
                ref: highlightRef
              }
            }
            return props
          }}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            backgroundColor: 'transparent',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}