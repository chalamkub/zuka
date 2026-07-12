"use client"

import * as React from "react"
import Link from "next/link"

import type { ApiResponse, ImageSlide } from "@/types"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

function SlideMedia({ slide }: { slide: ImageSlide }) {
  const hasText = slide.title || slide.subtitle
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt={slide.title || "slide"}
        className="size-full object-cover"
      />
      {hasText && (
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          {slide.title && (
            <h2 className="text-lg font-semibold text-white drop-shadow sm:text-2xl">
              {slide.title}
            </h2>
          )}
          {slide.subtitle && (
            <p className="mt-1 max-w-xl text-sm text-white/85 drop-shadow sm:text-base">
              {slide.subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function HeroCarousel() {
  const [slides, setSlides] = React.useState<ImageSlide[] | null>(null)
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    let active = true
    api
      .get<ApiResponse<ImageSlide[]>>("/slides")
      .then(({ data }) => {
        if (active) setSlides(data.data ?? [])
      })
      .catch(() => {
        if (active) setSlides([])
      })
    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    if (!carouselApi) return
    setCurrent(carouselApi.selectedScrollSnap())
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  const count = slides?.length ?? 0

  React.useEffect(() => {
    if (!carouselApi || count <= 1) return
    const id = setInterval(() => carouselApi.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [carouselApi, count])

  // ยังไม่โหลด หรือไม่มีสไลด์ → ไม่แสดงส่วนนี้เลย
  if (!slides || slides.length === 0) return null

  return (
    <Carousel
      setApi={setCarouselApi}
      opts={{ loop: true, align: "start" }}
      className="w-full"
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            {slide.link ? (
              <Link
                href={slide.link}
                target={slide.link.startsWith("http") ? "_blank" : undefined}
                rel={
                  slide.link.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="block"
              >
                <SlideMedia slide={slide} />
              </Link>
            ) : (
              <SlideMedia slide={slide} />
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      {slides.length > 1 && (
        <>
          <CarouselPrevious className="left-3 size-8 border-none bg-background/70 backdrop-blur hover:bg-background" />
          <CarouselNext className="right-3 size-8 border-none bg-background/70 backdrop-blur hover:bg-background" />

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`ไปสไลด์ที่ ${i + 1}`}
                onClick={() => carouselApi?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full bg-white/60 transition-all",
                  i === current ? "w-5 bg-white" : "w-1.5 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </Carousel>
  )
}
