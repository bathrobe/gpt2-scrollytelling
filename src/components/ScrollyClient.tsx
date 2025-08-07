'use client'

import { useState } from 'react'
import { Scrollama, Step } from 'react-scrollama'

interface StoryStep {
  id: string
  prosePath: string
  visualPane: {
    componentPath: string
    props: any
  }
  codePane: {
    filePath: string
    highlight: string
  }
  proseHtml: string
  codeContent: string
  highlightRange: [number, number]
}

interface ScrollyClientProps {
  storyData: StoryStep[]
}

export default function ScrollyClient({ storyData }: ScrollyClientProps) {
  const [activeStepId, setActiveStepId] = useState<string>(storyData[0]?.id || '')

  const onStepEnter = ({ data }: { data: string }) => {
    setActiveStepId(data)
  }

  const activeStep = storyData.find(step => step.id === activeStepId)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left pane - Narrative content */}
      <div className="flex-1 p-8 lg:pr-4">
        <Scrollama onStepEnter={onStepEnter} offset={0.6}>
          {storyData.map((step) => (
            <Step data={step.id} key={step.id}>
              <div className="max-w-prose mb-16 p-8 bg-white rounded-lg shadow-sm">
                <div 
                  dangerouslySetInnerHTML={{ __html: step.proseHtml }}
                />
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>

      {/* Right pane - Visual and Code panes */}
      <div className="lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        {/* Visual Pane */}
        <div className="flex-1 p-4 border-b border-gray-200">
          {activeStep && (
            <div className="h-full">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Visual</h3>
              <div className="h-full bg-gray-50 rounded border flex items-center justify-center">
                <p className="text-gray-500">
                  Component: {activeStep.visualPane.componentPath}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Code Pane */}
        <div className="flex-1 p-4">
          {activeStep && (
            <div className="h-full">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Code</h3>
              <div className="h-full bg-gray-900 rounded overflow-auto">
                <pre className="text-sm text-gray-300 p-4">
                  <code>{activeStep.codeContent}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}