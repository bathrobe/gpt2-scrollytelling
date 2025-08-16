'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

interface YouTubeDisplayProps {
  url: string
  start?: number
  playing?: boolean
  loop?: boolean
  controls?: boolean
  muted?: boolean
  caption?: string
}

export default function YouTubeDisplay({ 
  url, 
  start = 0,
  playing = false,
  loop = false,
  controls = true,
  muted = false,
  caption 
}: YouTubeDisplayProps) {
  // Build URL with timestamp if needed
  const videoUrl = start > 0 ? `${url}&t=${start}` : url

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <ReactPlayer
          url={videoUrl}
          playing={playing}
          loop={loop}
          controls={controls}
          muted={muted}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0
              }
            }
          }}
        />
      </div>
      {caption && (
        <div className="mt-4 text-gray-400 text-sm text-center">
          {caption}
        </div>
      )}
    </div>
  )
}