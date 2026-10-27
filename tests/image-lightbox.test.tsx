// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageLightbox } from "@/components/image-lightbox";

const images = [
  { id: "first", url: "/first.webp", alt: "첫 번째 화면", caption: "첫 번째 설명" },
  { id: "second", url: "/second.webp", alt: "두 번째 화면", caption: "두 번째 설명" },
  { id: "third", url: "/third.webp", alt: "세 번째 화면", caption: "세 번째 설명" },
];

beforeEach(() => {
  // jsdom은 레이아웃 폭을 계산하지 않으므로 슬라이더에 화면 크기를 제공한다.
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1024);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(768);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute("open", ""); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute("open"); },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ImageLightbox", () => {
  it("클릭한 이미지의 위치와 설명으로 확대 화면을 연다", () => {
    render(<ImageLightbox images={images} initialIndex={1} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "이미지 전체 화면 보기" })).toBeTruthy();
    expect(screen.getByText(/02\s*\/\s*03/)).toBeTruthy();
    expect(screen.getByText("두 번째 설명")).toBeTruthy();
    expect(screen.getByRole("button", { name: "이전 이미지" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "다음 이미지" })).toBeTruthy();
  });

  it("드래그 후 포커스가 본문으로 옮겨져도 방향키는 확대 화면만 전환한다", () => {
    const backgroundKeydown = vi.fn();
    document.addEventListener("keydown", backgroundKeydown);

    try {
      render(<ImageLightbox images={images} initialIndex={1} onClose={vi.fn()} />);

      fireEvent.keyDown(document.body, { key: "ArrowRight" });
      expect(screen.getByText(/03\s*\/\s*03/)).toBeTruthy();

      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(screen.getByText(/02\s*\/\s*03/)).toBeTruthy();
      expect(backgroundKeydown).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("keydown", backgroundKeydown);
    }
  });

  it("닫기 전환이 끝날 때까지 확대 화면을 유지한다", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<ImageLightbox images={images} initialIndex={0} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "전체 화면 닫기" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "이미지 전체 화면 보기" })).toBeTruthy();

    act(() => { vi.advanceTimersByTime(300); });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("책 표지처럼 이미지가 한 장이면 이전·다음 버튼을 표시하지 않는다", () => {
    render(<ImageLightbox images={[images[0]]} initialIndex={0} onClose={vi.fn()} />);

    expect(screen.getByRole("img", { name: "첫 번째 화면" })).toBeTruthy();
    expect(screen.getByText(/01\s*\/\s*01/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "이전 이미지" })).toBeNull();
    expect(screen.queryByRole("button", { name: "다음 이미지" })).toBeNull();
  });
});
