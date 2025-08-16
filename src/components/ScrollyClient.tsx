'use client'

import { useState, useEffect } from 'react'
import { Scrollama, Step } from 'react-scrollama'
import VisualPane from './VisualPane'
import CodePane from './CodePane'

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
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => {
      window.scrollTo(0, 0)
      setIsReady(true)
    }, 100)
  }, [])

  const onStepEnter = ({ data }: { data: string }) => {
    if (!isReady) return
    setActiveStepId(data)
  }

  const activeStep = storyData.find(step => step.id === activeStepId)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 py-8 px-8 lg:px-12 xl:px-20">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">A Brief Tour of my NanoGPT</h1>
          <p className="text-gray-400">by Joe Holmes</p>
        </div>
      </header>
      
      <div className="lg:grid lg:grid-cols-[minmax(0,_1fr)_55%] xl:grid-cols-[minmax(0,_1fr)_50%] max-w-[1800px] mx-auto">
      {/* Left pane - Narrative content */}
      <div className="px-8 py-16 lg:px-12 xl:px-20 2xl:px-24">
        <div className="prose prose-lg prose-invert prose-gray prose-p:text-gray-300 prose-headings:text-gray-100" style={{ maxWidth: '65ch' }}>
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
        <div className="h-1/2 bg-gray-900 p-6 xl:p-8 overflow-auto border-b border-gray-800">
          {activeStep && (
            <div className="h-full flex flex-col">
              <div className="h-full overflow-auto">
                <VisualPane visualPane={activeStep.visualPane} />
              </div>
            </div>
          )}
        </div>

        {/* Code Pane */}
        <div className="h-1/2 bg-gray-900 p-6 xl:p-8 overflow-auto">
          {activeStep && (
            <div className="h-full flex flex-col">
              <div className="h-full overflow-auto">
                <CodePane
                  codePane={activeStep.codePane}
                  codeContent={activeStep.codeContent}
                  highlightRange={activeStep.highlightRange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}