// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContentImage } from "@/components/content-image";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("ContentImage", () => {
  it("고해상도 후보가 없는 기존 이미지는 단일 경로를 유지한다", () => {
    render(<ContentImage src="/cover.webp" alt="기존 표지" />);

    const image = screen.getByRole("img", { name: "기존 표지" });
    expect(image.getAttribute("src")).toBe("/cover.webp");
    expect(image.getAttribute("srcset")).toBeNull();
  });

  it("반응형 이미지 후보에도 배포 기준 경로를 적용하고 외부 URL은 유지한다", () => {
    vi.stubEnv("BASE_URL", "/y-brary/");
    render(<ContentImage
      src="/screen-2880.webp"
      sources={[
        { url: "/screen-640.webp", width: 640 },
        { url: "https://example.com/screen-2880.webp", width: 2880 },
      ]}
      alt="반응형 화면"
      sizes="100vw"
    />);

    const image = screen.getByRole("img", { name: "반응형 화면" });
    expect(image.getAttribute("src")).toBe("/y-brary/screen-2880.webp");
    expect(image.getAttribute("srcset")).toBe("/y-brary/screen-640.webp 640w, https://example.com/screen-2880.webp 2880w");
    expect(image.getAttribute("sources")).toBeNull();
  });

  it("이미지 경로가 없으면 fallback 문구를 표시한다", () => {
    render(<ContentImage src={null} alt="표지" fill />);

    expect(screen.getByRole("img", { name: "아직 이미지가 첨부되지 않았어요." })).toBeTruthy();
  });

  it("이미지 로드에 실패하면 fallback 문구로 전환한다", () => {
    render(<ContentImage src="/missing-image.jpg" alt="표지" fill />);

    fireEvent.error(screen.getByAltText("표지"));

    expect(screen.getByRole("img", { name: "아직 이미지가 첨부되지 않았어요." })).toBeTruthy();
  });
});
