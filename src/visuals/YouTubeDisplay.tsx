'use client'

import ReactPlayer from 'react-player'

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
  const playerConfig = {
    youtube: {
      playerVars: {
        start: start,
        modestbranding: 1,
        rel: 0
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <ReactPlayer
            url={url}
            playing={playing}
            loop={loop}
            controls={controls}
            muted={muted}
            width="100%"
            height="100%"
            config={playerConfig}
          />
        </div>
      </div>
      {caption && (
        <div className="mt-4 mb-4 text-gray-400 text-sm text-center max-w-4xl">
          {caption}
        </div>
      )}
    </div>
  )
}