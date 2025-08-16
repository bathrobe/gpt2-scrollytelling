'use client'

import { useState } from 'react'

interface GradioSpaceDisplayProps {
  spaceUrl?: string
  width?: string
  height?: string
}

export default function GradioSpaceDisplay({ 
  spaceUrl = "https://bathrobe-my-gpt2.hf.space",
  width = "100%", 
  height = "100%" 
}: GradioSpaceDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading GPT-2 Model...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Failed to load Gradio app</p>
            <a 
              href={spaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Open in new tab →
            </a>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <iframe
          src={spaceUrl}
          width={width}
          height="800"
          frameBorder="0"
          className="rounded-lg shadow-lg w-full"
          onLoad={handleLoad}
          onError={handleError}
          title="GPT-2 Model Interactive Demo"
          style={{ 
            opacity: isLoading || hasError ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </div>
    </div>
  )
}