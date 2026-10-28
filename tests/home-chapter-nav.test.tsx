// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeChapterNav } from "@/components/home-chapter-nav";

const chapters = [
  { id: "home-projects", label: "프로젝트" },
  { id: "home-books", label: "책" },
  { id: "home-courses", label: "강의 기록" },
  { id: "home-notes", label: "학습 정리" },
  { id: "home-recent", label: "최근 기록" },
];
let scrollOffset = 0;
const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");

function renderChapters() {
  return render(
    <>
      <HomeChapterNav items={chapters} />
      {chapters.map(({ id, label }) => <section key={id} id={id} tabIndex={-1} aria-label={label}><h2>{label}</h2></section>)}
    </>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  scrollOffset = 0;
  window.history.replaceState(null, "", "/");
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const index = chapters.findIndex(({ id }) => id === this.id);
    const top = 200 + index * 400 - scrollOffset;
    return { x: 0, y: top, top, bottom: top + 350, width: 800, height: 350, left: 0, right: 800, toJSON() {} };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  if (originalScrollY) Object.defineProperty(window, "scrollY", originalScrollY);
  window.history.replaceState(null, "", "/");
});

describe("홈 목차", () => {
  it("없는 해시에도 안전하게 시작하고 목차 클릭으로 해당 섹션과 현재 위치를 연결한다", () => {
    window.history.replaceState(null, "", "/#missing-section");
    renderChapters();
    act(() => { vi.runAllTimers(); });
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(chapters.map(({ id }) => `#${id}`));
    expect(links[0].getAttribute("aria-current")).toBe("location");

    fireEvent.click(screen.getByRole("link", { name: "책" }));
    expect(screen.getByRole("region", { name: "책" })).toBe(document.activeElement);
    expect(screen.getByRole("link", { name: "책" }).getAttribute("aria-current")).toBe("location");
  });

  it("직접 해시와 뒤로가기 위치를 복원하고 사용자가 스크롤하면 현재 목차를 갱신한다", () => {
    window.history.replaceState(null, "", "/#home-books");
    renderChapters();
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole("region", { name: "책" })).toBe(document.activeElement);
    expect(screen.getByRole("link", { name: "책" }).getAttribute("aria-current")).toBe("location");

    window.history.replaceState(null, "", "/#home-notes");
    fireEvent(window, new HashChangeEvent("hashchange"));
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole("region", { name: "학습 정리" })).toBe(document.activeElement);
    expect(screen.getByRole("link", { name: "학습 정리" }).getAttribute("aria-current")).toBe("location");

    document.getElementById(chapters[0].id)!.style.scrollMarginTop = "156px";
    scrollOffset = 900;
    fireEvent.wheel(window);
    fireEvent.scroll(window);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole("link", { name: "강의 기록" }).getAttribute("aria-current")).toBe("location");
  });

  it("짧은 첫 화면은 첫 항목을 유지하고 실제 페이지 끝까지 스크롤하면 마지막 목차를 표시한다", () => {
    const pageHeight = vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(100);
    renderChapters();
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole("link", { name: "프로젝트" }).getAttribute("aria-current")).toBe("location");

    pageHeight.mockReturnValue(window.innerHeight + 200);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    fireEvent.scroll(window);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole("link", { name: "최근 기록" }).getAttribute("aria-current")).toBe("location");
  });
});
