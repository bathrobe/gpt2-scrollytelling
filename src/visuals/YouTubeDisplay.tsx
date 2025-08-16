'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

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
    <div className="w-full h-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl" style={{ aspectRatio: '16/9' }}>
        <ReactPlayer
          src={videoUrl}
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
        <div className="mt-4 text-gray-400 text-sm text-center max-w-4xl">
          {caption}
        </div>
      )}
    </div>
  )
}