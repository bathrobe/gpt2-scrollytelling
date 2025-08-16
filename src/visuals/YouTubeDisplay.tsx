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
  // Append timestamp to URL using ?t= parameter
  const videoUrl = start > 0 ? `${url}&t=${start}` : url

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4">
      <div className="w-full h-full max-w-4xl flex flex-col gap-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl relative">
            <ReactPlayer
              url={videoUrl}
              playing={playing}
              loop={loop}
              controls={controls}
              muted={muted}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    start: start
                  }
                }
              }}
            />
          </div>
        </div>
        {caption && (
          <div className="text-gray-400 text-sm text-center px-4">
            {caption}
          </div>
        )}
      </div>
    </div>
  )
}