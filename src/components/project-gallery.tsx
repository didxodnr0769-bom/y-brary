"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ContentImage } from "@/components/content-image";
import { ArrowIcon, CloseIcon } from "@/components/ui-icons";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type ProjectGalleryImage = {
  alt: string;
  caption?: string;
  id: string;
  url: string;
};

export function ProjectGallery({ images }: { images: ProjectGalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageCount = images.length;
  const lightboxOpen = activeIndex !== null;

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : (index - 1 + imageCount) % imageCount));
  }, [imageCount]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index === null ? null : (index + 1) % imageCount));
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

  return (
    <>
      <section className="project-gallery" aria-label="프로젝트 이미지 갤러리">
        <Swiper
          modules={[Navigation, Pagination, Keyboard, A11y]}
          slidesPerView={1}
          navigation={imageCount > 1}
          pagination={imageCount > 1 ? { clickable: true } : false}
          keyboard={{ enabled: true, onlyInViewport: true }}
          rewind={imageCount > 1}
          watchOverflow
          a11y={{
            containerMessage: "프로젝트 이미지 갤러리",
            firstSlideMessage: "첫 번째 이미지입니다.",
            lastSlideMessage: "마지막 이미지입니다.",
            nextSlideMessage: "다음 이미지",
            paginationBulletMessage: "{{index}}번째 이미지로 이동",
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
                {image.caption ? <span className="gallery-slide-caption">{image.caption}</span> : null}
                <span className="gallery-expand-label" aria-hidden="true">
                  확대 보기 ↗
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
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
