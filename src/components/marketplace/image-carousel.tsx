'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export function ImageCarousel({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [current, setCurrent] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl">📦</div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-hidden aspect-video bg-gray-100" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((url, i) => (
            <div key={i} className="flex-none w-full h-full">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? 'bg-white w-3' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}