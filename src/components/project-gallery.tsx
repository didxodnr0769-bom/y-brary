import { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ContentImage } from "@/components/content-image";
import { ImageLightbox, type LightboxImage } from "@/components/image-lightbox";
import { ArrowIcon } from "@/components/ui-icons";

import "swiper/css";

export type ProjectGalleryImage = LightboxImage;

export function ProjectGallery({ images }: { images: ProjectGalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const imageCount = images.length;

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
            keyboard={{ enabled: activeIndex === null, onlyInViewport: true }}
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

      {activeIndex !== null ? (
        <ImageLightbox
          images={images}
          initialIndex={activeIndex}
          label="프로젝트 이미지 전체 화면 보기"
          onClose={() => setActiveIndex(null)}
        />
      ) : null}
    </>
  );
}
