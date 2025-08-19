"use client"

import { useState, useEffect } from 'react'
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
  // No highlighting when range is [0, 0]
  if (start === 0 && end === 0) {
    return false
  }
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
  

  // Cross-fade transition when codePane changes
  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [codePane.filePath])

  // Auto-scroll to highlighted section
  useEffect(() => {
    const [start, end] = highlightRange
    if (start > 0 && end > 0) {
      // Wait for the component to render and transition to complete
      const timer = setTimeout(() => {
        const container = document.querySelector('.code-container') as HTMLElement
        if (container) {
          // Find all line number spans
          const lineNumberSpans = container.querySelectorAll('.linenumber')
          
          // Find the span for the start line
          let targetElement: HTMLElement | null = null
          lineNumberSpans.forEach(span => {
            const lineNum = parseInt(span.textContent || '0')
            if (lineNum === start && span.parentElement) {
              // Get the parent line element
              targetElement = span.parentElement as HTMLElement
            }
          })
          
          if (targetElement !== null) {
            // Calculate position to center the highlighted section
            const containerRect = container.getBoundingClientRect()
            const elementRect = (targetElement as HTMLElement).getBoundingClientRect()
            const relativeTop = elementRect.top - containerRect.top + container.scrollTop
            
            // Scroll to position the highlight at 1/3 from top for better visibility
            const scrollPosition = relativeTop - containerRect.height / 3
            
            container.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'smooth'
            })
          } else {
            // Fallback to calculated scroll if we can't find the element
            const lineHeight = 24
            const targetLine = Math.max(start - 3, 1)
            const scrollTop = (targetLine - 1) * lineHeight
            container.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            })
          }
        }
      }, 350) // Slight delay to ensure rendering is complete
      return () => clearTimeout(timer)
    }
  }, [highlightRange, codePane.filePath])


  return (
    <div 
      key={codePane.filePath}
      className={`transition-opacity duration-300 h-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="code-container h-full bg-gray-950 rounded-lg overflow-auto">
        <SyntaxHighlighter
          language="python"
          style={nightOwl}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const inRange = isLineInRange(lineNumber, highlightRange)
            const props = createLineProps(lineNumber, highlightRange)
            return props
          }}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            backgroundColor: 'transparent',
            fontSize: '0.75rem',
            lineHeight: '1.6'
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}