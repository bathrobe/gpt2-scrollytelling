import { loadStoryData } from '@/lib/content';

export default function Home() {
  const storyData = loadStoryData();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 max-w-7xl mx-auto">
        {/* Left column - scrollable narrative */}
        <div className="px-8 py-16 lg:px-12">
          <div className="prose prose-lg prose-invert prose-gray max-w-none">
            {/* Placeholder for client component that will handle scroll events */}
            <div className="space-y-32">
              {storyData.map((step) => (
                <section key={step.id} className="min-h-[60vh]">
                  <div dangerouslySetInnerHTML={{ __html: step.proseHtml }} />
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - sticky container with two panes */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col border-l border-gray-800">
          {/* Top pane - Visual */}
          <div className="h-1/2 bg-gray-900 p-8 overflow-hidden border-b border-gray-800">
            <div className="h-full flex items-center justify-center text-gray-300 text-sm font-medium">
              Visual Pane (Placeholder)
            </div>
          </div>

          {/* Bottom pane - Code */}
          <div className="h-1/2 bg-gray-900 p-8 overflow-auto">
            <div className="text-gray-300 text-sm font-medium">
              Code Pane (Placeholder)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}