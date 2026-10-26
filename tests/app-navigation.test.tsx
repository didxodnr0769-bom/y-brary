// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app";
import { assetUrl } from "@/lib/urls";

beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(cleanup);

describe("React 앱 탐색", () => {
  it("URL 검색어를 적용하고 검색 및 초기화를 브라우저에서 처리한다", () => {
    render(<MemoryRouter initialEntries={["/?q=major"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Major Scale Lab" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Color Picker Game" })).toBeNull();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "color picker" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByRole("heading", { name: "Color Picker Game" })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("color picker");
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getByRole("heading", { name: "젊은 베르테르의 슬픔" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "프로젝트 헤일메리" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "YBrary" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
  });

  it("프로젝트 전용 목록과 검색은 /projects에 유지한다", () => {
    render(<MemoryRouter initialEntries={["/projects?q=major"]}><App /></MemoryRouter>);
    expect(document.title).toBe("프로젝트 | YBrary");
    expect(screen.getByRole("heading", { name: "Major Scale Lab" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "프로젝트 헤일메리" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
  });

  it("학습 정리 직접 접속과 없는 기록의 안내를 표시한다", () => {
    const view = render(<MemoryRouter initialEntries={["/notes"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "배운 것을 내 것으로" })).toBeTruthy();
    expect(document.title).toBe("학습 정리 | YBrary");
    view.unmount();
    render(<MemoryRouter initialEntries={["/courses/missing"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "기록을 찾을 수 없습니다." })).toBeTruthy();
  });

  it("저장소 하위 경로를 내부 이미지에만 붙인다", () => {
    expect(assetUrl("/content/cover.webp", "/y-brary/")).toBe("/y-brary/content/cover.webp");
    expect(assetUrl("https://example.com/cover.webp", "/y-brary/")).toBe("https://example.com/cover.webp");
  });
});
