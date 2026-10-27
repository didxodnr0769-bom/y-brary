import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ContentImage } from "@/components/content-image";
import { ArrowIcon, CloseIcon } from "@/components/ui-icons";

import "swiper/css";

export type LightboxImage = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
};

export function ImageLightbox({
  images,
  initialIndex,
  label = "이미지 전체 화면 보기",
  onClose,
}: {
  images: LightboxImage[];
  initialIndex: number;
  label?: string;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isClosing, setIsClosing] = useState(false);
  const [reducedMotion] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const image = images[activeIndex];

  const requestClose = useCallback(() => {
    if (closeTimerRef.current !== null) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(onClose, reducedMotion ? 0 : 200);
  }, [onClose, reducedMotion]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    // Swiper first mounts while the dialog is hidden, so measure it again after opening.
    swiperRef.current?.update();
    swiperRef.current?.slideTo(initialIndex, 0);

    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [initialIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!["Escape", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === "Escape") requestClose();
      else if (!isClosing && event.key === "ArrowLeft") swiperRef.current?.slidePrev();
      else if (!isClosing) swiperRef.current?.slideNext();
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isClosing, requestClose]);

  return (
    <dialog
      ref={dialogRef}
      className="gallery-lightbox"
      data-state={isClosing ? "closing" : "open"}
      data-single-image={images.length === 1 ? "true" : undefined}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <button
        autoFocus
        className="gallery-lightbox-close"
        type="button"
        aria-label="전체 화면 닫기"
        onClick={requestClose}
      >
        <CloseIcon />
      </button>

      {images.length > 1 ? (
        <button
          className="gallery-lightbox-nav gallery-lightbox-prev"
          type="button"
          aria-label="이전 이미지"
          disabled={activeIndex === 0 || isClosing}
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ArrowIcon direction="left" />
        </button>
      ) : null}

      <div className="gallery-lightbox-stage">
        <Swiper
          className="gallery-lightbox-slider"
          modules={[A11y, Mousewheel]}
          initialSlide={initialIndex}
          slidesPerView={1}
          spaceBetween={24}
          speed={reducedMotion ? 0 : 280}
          allowTouchMove={images.length > 1 && !isClosing}
          simulateTouch
          grabCursor={images.length > 1}
          mousewheel={images.length > 1 ? { forceToAxis: true, thresholdDelta: 25, thresholdTime: 300 } : false}
          watchOverflow
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => {
            if (dialogRef.current?.open) setActiveIndex(swiper.activeIndex);
          }}
          a11y={{ containerMessage: label, slideLabelMessage: "{{index}} / {{slidesLength}}" }}
        >
          {images.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="gallery-lightbox-image">
                <ContentImage src={item.url} alt={item.alt} fill sizes="100vw" draggable={false} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="gallery-lightbox-meta" aria-live="polite" aria-atomic="true">
          <span>{image.caption ?? image.alt}</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
        </div>
      </div>

      {images.length > 1 ? (
        <button
          className="gallery-lightbox-nav gallery-lightbox-next"
          type="button"
          aria-label="다음 이미지"
          disabled={activeIndex === images.length - 1 || isClosing}
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ArrowIcon direction="right" />
        </button>
      ) : null}
    </dialog>
  );
}
