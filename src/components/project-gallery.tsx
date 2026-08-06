"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ContentImage } from "@/components/content-image";
import { ArrowIcon, CloseIcon } from "@/components/ui-icons";

import "swiper/css";

export type ProjectGalleryImage = {
  alt: string;
  caption?: string;
  id: string;
  url: string;
};

export function ProjectGallery({ images }: { images: ProjectGalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const imageCount = images.length;
  const lightboxOpen = activeIndex !== null;

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : Math.max(0, index - 1)));
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : Math.min(imageCount - 1, index + 1)));
  }, [imageCount]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, showNext, showPrevious]);

  const selectedImage = activeIndex === null ? null : images[activeIndex];
  const selectedPosition = activeIndex === null ? 0 : activeIndex + 1;

  if (imageCount === 0) {
    return (
      <section className="project-gallery-section" aria-label="프로젝트 이미지">
        <div className="project-gallery">
          <ContentImage src={null} alt="" fill sizes="(max-width: 900px) 100vw, 1400px" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="project-gallery-section" aria-label="프로젝트 이미지 갤러리">
        <div className="project-gallery">
          <Swiper
            modules={[Keyboard, A11y]}
            slidesPerView={1}
            keyboard={{ enabled: true, onlyInViewport: true }}
            watchOverflow
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setSlideIndex(swiper.activeIndex);
            }}
            onSlideChange={(swiper) => setSlideIndex(swiper.activeIndex)}
            a11y={{
              containerMessage: "프로젝트 이미지 갤러리",
              firstSlideMessage: "첫 번째 이미지입니다.",
              lastSlideMessage: "마지막 이미지입니다.",
              nextSlideMessage: "다음 이미지",
              prevSlideMessage: "이전 이미지",
              slideLabelMessage: "{{index}} / {{slidesLength}}",
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.id}>
                <button
                  className="gallery-slide-button"
                  type="button"
                  aria-label={`${image.alt} 크게 보기`}
                  onClick={() => setActiveIndex(index)}
                >
                  <ContentImage
                    src={image.url}
                    alt={image.alt}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 900px) 100vw, 1400px"
                  />
                  {image.caption ? (
                    <span className="gallery-slide-caption">{image.caption}</span>
                  ) : null}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {imageCount > 1 ? (
            <>
              <button
                className="project-gallery-nav project-gallery-prev"
                type="button"
                aria-label="이전 이미지"
                disabled={slideIndex === 0}
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                className="project-gallery-nav project-gallery-next"
                type="button"
                aria-label="다음 이미지"
                disabled={slideIndex === imageCount - 1}
                onClick={() => swiperRef.current?.slideNext()}
              >
                <ArrowIcon direction="right" />
              </button>
            </>
          ) : null}
        </div>

        {imageCount > 1 ? (
          <div className="project-gallery-pagination" aria-label="프로젝트 이미지 선택">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`${index + 1}번째 이미지로 이동`}
                aria-current={slideIndex === index ? "true" : undefined}
                onClick={() => swiperRef.current?.slideTo(index)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {selectedImage ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="프로젝트 이미지 전체 화면 보기"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <button
            ref={closeButtonRef}
            className="gallery-lightbox-close"
            type="button"
            aria-label="전체 화면 닫기"
            onClick={() => setActiveIndex(null)}
          >
            <CloseIcon />
          </button>

          {imageCount > 1 ? (
            <button
              className="gallery-lightbox-nav gallery-lightbox-prev"
              type="button"
              aria-label="이전 이미지"
              disabled={selectedPosition === 1}
              onClick={showPrevious}
            >
              <ArrowIcon direction="left" />
            </button>
          ) : null}

          <div className="gallery-lightbox-stage">
            <div className="gallery-lightbox-image">
              <ContentImage src={selectedImage.url} alt={selectedImage.alt} fill sizes="100vw" />
            </div>
            <div className="gallery-lightbox-meta">
              <span>{selectedImage.caption ?? selectedImage.alt}</span>
              <span>
                {String(selectedPosition).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}
              </span>
            </div>
          </div>

          {imageCount > 1 ? (
            <button
              className="gallery-lightbox-nav gallery-lightbox-next"
              type="button"
              aria-label="다음 이미지"
              disabled={selectedPosition === imageCount}
              onClick={showNext}
            >
              <ArrowIcon direction="right" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
