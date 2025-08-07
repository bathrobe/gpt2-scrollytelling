'use client'

import { useState } from 'react'
import { Scrollama, Step } from 'react-scrollama'
import VisualPane from './VisualPane'

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
    <div className="lg:grid lg:grid-cols-2 lg:gap-8 max-w-7xl mx-auto min-h-screen">
      {/* Left pane - Narrative content */}
      <div className="px-8 py-16 lg:px-12">
        <div className="prose prose-lg prose-invert prose-gray max-w-none">
          <Scrollama onStepEnter={onStepEnter} offset={0.6}>
            {storyData.map((step) => (
              <Step data={step.id} key={step.id}>
                <section className="min-h-[60vh] mb-32">
                  <div 
                    dangerouslySetInnerHTML={{ __html: step.proseHtml }}
                  />
                </section>
              </Step>
            ))}
          </Scrollama>
        </div>
      </div>

      {/* Right pane - Visual and Code panes */}
      <div className="lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col border-l border-gray-800">
        {/* Visual Pane */}
        <div className="h-1/2 bg-gray-900 p-8 overflow-hidden border-b border-gray-800">
          {activeStep && (
            <div className="h-full">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Visual</h3>
              <div className="h-full">
                <VisualPane visualPane={activeStep.visualPane} />
              </div>
            </div>
          )}
        </div>

        {/* Code Pane */}
        <div className="h-1/2 bg-gray-900 p-8 overflow-auto">
          {activeStep && (
            <div className="h-full">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Code</h3>
              <div className="h-full bg-gray-950 rounded overflow-auto">
                <pre className="text-sm text-gray-300 p-4 h-full">
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