// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContentImage } from "@/components/content-image";

afterEach(cleanup);

describe("ContentImage", () => {
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
