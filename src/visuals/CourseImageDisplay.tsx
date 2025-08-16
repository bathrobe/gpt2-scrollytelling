import Image from 'next/image'

export default function CourseImageDisplay() {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="max-w-full max-h-full">
        <Image
          src="/images/COURSE_IMAGE.png"
          alt="From NAND to Tetris course image"
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}