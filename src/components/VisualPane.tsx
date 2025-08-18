"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

interface VisualPaneProps {
  visualPane: {
    componentPath: string
    props: any
  }
}

// Component resolver that maps paths to dynamic imports
const componentResolver = (componentPath: string) => {
  switch (componentPath) {
    case 'visuals/ImageDisplay':
      return dynamic(() => import('../visuals/ImageDisplay'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/AttentionVisualizer':
      return dynamic(() => import('../visuals/AttentionVisualizer'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/TrainingPlotDisplay':
      return dynamic(() => import('../visuals/TrainingPlotDisplay'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/CourseImageDisplay':
      return dynamic(() => import('../visuals/CourseImageDisplay'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/GradioSpaceDisplay':
      return dynamic(() => import('../visuals/GradioSpaceDisplay'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/GPTArchitectureVisual':
      return dynamic(() => import('../visuals/GPTArchitectureVisual'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/YouTubeDisplay':
      return dynamic(() => import('../visuals/YouTubeDisplay'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/ResidualFlowVisual':
      return dynamic(() => import('../visuals/ResidualFlowVisual'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/AttentionOptimizationVisual':
      return dynamic(() => import('../visuals/AttentionOptimizationVisual'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/SpeedupVisualization':
      return dynamic(() => import('../visuals/SpeedupVisualization'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/GradientAccumulationVisual':
      return dynamic(() => import('../visuals/GradientAccumulationVisual'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    case 'visuals/DDPVisual':
      return dynamic(() => import('../visuals/DDPVisual'), {
        loading: () => <div className="animate-pulse bg-gray-200 w-full h-32 rounded" />
      })
    default:
      return null
  }
}

export default function VisualPane({ visualPane }: VisualPaneProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Trigger cross-fade animation when component changes
  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [visualPane.componentPath])

  const DynamicComponent = componentResolver(visualPane.componentPath)

  if (!DynamicComponent) {
    return (
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Unknown component: {visualPane.componentPath}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      key={visualPane.componentPath}
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <DynamicComponent {...visualPane.props} />
    </div>
  )
}