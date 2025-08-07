interface AttentionVisualizerProps {
  title?: string
  data?: any
}

export default function AttentionVisualizer({ title = "Attention Map", data }: AttentionVisualizerProps) {
  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 border-2 border-purple-300">
      <div className="text-center">
        <div className="bg-purple-500 text-white px-4 py-2 rounded-full mb-4 text-sm font-semibold inline-block">
          ⚡ SCROLL TRIGGER ACTIVE
        </div>
        <div className="bg-white rounded-lg p-4 shadow-inner">
          <div className="text-purple-700 font-bold mb-4">{title}</div>
          
          {/* Simple attention visualization mockup */}
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: `hsl(${280 + (i * 3) % 60}, 70%, ${50 + (i * 5) % 40}%)`
                }}
              />
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Attention weights visualization
          </div>
        </div>
        <div className="mt-4 text-purple-700 font-medium">
          Component: AttentionVisualizer
        </div>
      </div>
    </div>
  )
}