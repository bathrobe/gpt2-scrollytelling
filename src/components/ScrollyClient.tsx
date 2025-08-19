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
      <header className="py-10 px-8 lg:px-12 xl:px-20" style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)',
        borderBottom: '1px solid rgba(100, 255, 218, 0.15)'
      }}>
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-4" style={{
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Consolas", monospace',
                color: '#e0e6ed',
                letterSpacing: '1px'
              }}>
                A Brief Tour of my NanoGPT
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs" style={{
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Consolas", monospace',
                  background: 'rgba(100, 255, 218, 0.1)',
                  border: '1px solid rgba(100, 255, 218, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ color: 'rgba(100, 255, 218, 0.8)', marginRight: '8px' }}>words by</span>
                  <span style={{ color: '#64f5d0', fontWeight: 'bold' }}>Joe Holmes</span>
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs" style={{
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Consolas", monospace',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ color: 'rgba(102, 126, 234, 0.8)', marginRight: '8px' }}>code by</span>
                  <span style={{ color: '#667eea', fontWeight: 'bold' }}>Claude Code</span>
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs" style={{
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Consolas", monospace',
                  background: 'rgba(255, 200, 100, 0.1)',
                  border: '1px solid rgba(255, 200, 100, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ color: 'rgba(255, 200, 100, 0.8)', marginRight: '8px' }}>tutorial by</span>
                  <span style={{ color: '#ffc864', fontWeight: 'bold' }}>Andrej Karpathy</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="lg:grid lg:grid-cols-[minmax(0,_1fr)_55%] xl:grid-cols-[minmax(0,_1fr)_50%] max-w-[1800px] mx-auto">
      {/* Left pane - Narrative content */}
      <div className="px-8 py-16 lg:px-12 xl:px-20 2xl:px-24">
        <div className="prose prose-lg prose-invert prose-gray prose-p:text-gray-300 prose-headings:text-gray-100" style={{ maxWidth: '65ch' }}>
          <Scrollama onStepEnter={onStepEnter} offset={0.1}>
            {storyData.map((step, index) => (
              <Step data={step.id} key={step.id}>
                <section className={`min-h-[60vh] ${index === storyData.length - 1 ? 'mb-[100vh]' : 'mb-32'}`}>
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