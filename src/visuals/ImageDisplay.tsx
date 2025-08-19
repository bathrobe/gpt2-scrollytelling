interface ImageDisplayProps {
  src: string
  alt: string
  caption?: string
}

export default function ImageDisplay({ src, alt, caption }: ImageDisplayProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4">
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center" style={{ maxHeight: '90%', maxWidth: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt}
            className="object-contain w-full h-full"
            style={{ 
              maxHeight: '100%',
              maxWidth: '100%'
            }}
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<div class="flex flex-col items-center justify-center py-16 px-8 bg-gray-800">
                  <div class="text-6xl mb-4 opacity-50">🖼️</div>
                  <p class="text-gray-400 text-lg mb-2">${alt}</p>
                  <p class="text-gray-600 text-sm font-mono">${src}</p>
                </div>`
              }
            }}
          />
        </div>
        {caption && (
          <div className="mt-2 text-gray-400 text-xs text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  )
}