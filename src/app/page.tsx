import { loadStoryData } from '@/lib/content';
import ScrollyClient from '@/components/ScrollyClient';

export default function Home() {
  const storyData = loadStoryData();

  return (
    <div className="min-h-screen bg-gray-950">
      <ScrollyClient storyData={storyData} />
    </div>
  );
}