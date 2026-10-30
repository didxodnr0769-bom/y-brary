// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app";

const { pageView, projectLink } = vi.hoisted(() => ({ pageView: vi.fn(), projectLink: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ analytics: { pageView, projectLink } }));
vi.mock("@/lib/content/static-data", () => ({
  projects: [{
    id: "project-analytics-sample", slug: "analytics-sample", title: "통계 테스트 프로젝트",
    summary: "테스트용 샘플 프로젝트", description: "[본문 참고 링크](https://docs.example.test/guide)",
    thumbnail: null, screenshots: [], tags: ["React"], period: null,
    githubUrl: "https://github.com/example/sample?tab=readme#intro",
    liveUrl: "https://project.example.test/demo?campaign=sample#start",
    publishedAt: "2026-10-30", isSample: true,
  }],
  reviews: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.scrollTo = vi.fn();
});
afterEach(cleanup);

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

describe("화면 탐색과 GA 연결", () => {
  it("검색·태그 조건만 바꾸면 페이지 조회를 추가하지 않는다", () => {
    renderAt("/projects");
    expect(pageView).toHaveBeenCalledExactlyOnceWith("/projects", "프로젝트 | YBrary");

    fireEvent.click(within(screen.getByRole("navigation", { name: "프로젝트 태그" })).getByRole("link", { name: /^React/ }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "통계" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByRole("heading", { name: "통계 테스트 프로젝트" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(pageView).toHaveBeenCalledTimes(1);
    expect(projectLink).not.toHaveBeenCalled();
  });

  it("목록 → 상세 → 목록 이동을 실제 제목과 함께 한 번씩 전달한다", async () => {
    renderAt("/projects");
    fireEvent.click(screen.getByRole("link", { name: /통계 테스트 프로젝트/ }));
    await screen.findByRole("heading", { name: "통계 테스트 프로젝트", level: 1 });
    expect(pageView).toHaveBeenLastCalledWith("/projects/analytics-sample", "통계 테스트 프로젝트 | YBrary");
    fireEvent.click(screen.getByRole("link", { name: /프로젝트 목록/ }));
    expect(pageView.mock.calls).toEqual([
      ["/projects", "프로젝트 | YBrary"],
      ["/projects/analytics-sample", "통계 테스트 프로젝트 | YBrary"],
      ["/projects", "프로젝트 | YBrary"],
    ]);
    expect(projectLink).not.toHaveBeenCalled();
  });

  it("프로젝트의 GitHub·사이트 링크만 클릭 측정에 연결한다", async () => {
    renderAt("/projects/analytics-sample");
    await screen.findByRole("heading", { name: "통계 테스트 프로젝트", level: 1 });
    fireEvent.click(screen.getByRole("link", { name: /GitHub/ }));
    const siteLink = screen.getByRole("link", { name: "사이트 ↗" });
    fireEvent(siteLink, new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    expect(projectLink.mock.calls).toEqual([
      ["analytics-sample", "github", "https://github.com/example/sample?tab=readme#intro"],
      ["analytics-sample", "site", "https://project.example.test/demo?campaign=sample#start"],
    ]);

    const bodyLink = screen.getByRole("link", { name: "본문 참고 링크" });
    bodyLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(bodyLink);
    fireEvent.click(screen.getByRole("link", { name: "방문 통계 안내" }));
    fireEvent(siteLink, new MouseEvent("auxclick", { bubbles: true, button: 2 }));
    expect(projectLink).toHaveBeenCalledTimes(2);
    expect(pageView).toHaveBeenCalledExactlyOnceWith("/projects/analytics-sample", "통계 테스트 프로젝트 | YBrary");
  });
});
