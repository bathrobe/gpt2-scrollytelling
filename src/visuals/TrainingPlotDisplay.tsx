import Image from 'next/image'

export default function TrainingPlotDisplay() {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="max-w-full max-h-full">
        <Image
          src="/images/training_eval_plot.png"
          alt="Training and evaluation loss plots showing model performance"
          width={800}
          height={400}
          className="rounded-lg shadow-lg"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}