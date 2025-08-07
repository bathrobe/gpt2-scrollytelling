interface ImageDisplayProps {
  src: string
  alt: string
}

export default function ImageDisplay({ src, alt }: ImageDisplayProps) {
  return (
    <div className="w-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 border-2 border-blue-300">
      <div className="text-center">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-full mb-4 text-sm font-semibold inline-block">
          🎯 SCROLL TRIGGER ACTIVE
        </div>
        <div className="bg-white rounded-lg p-4 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={alt}
            className="max-w-full h-auto rounded"
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<div class="text-gray-600 py-8"><div class="text-4xl mb-2">🖼️</div><p>Image: ${alt}</p><p class="text-sm text-gray-400">${src}</p></div>`
              }
            }}
          />
        </div>
        <div className="mt-4 text-blue-700 font-medium">
          Step: {alt}
        </div>
      </div>
    </div>
  )
}