// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app";
import { listProjects } from "@/lib/content/repository";
import { assetUrl } from "@/lib/urls";

beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(cleanup);

function CurrentLocation() {
  const location = useLocation();
  return <output aria-label="현재 경로">{location.pathname}{location.search}</output>;
}

describe("React 앱 탐색", () => {
  it("프로젝트 URL 검색어를 적용하고 검색 및 초기화를 브라우저에서 처리한다", () => {
    render(<MemoryRouter initialEntries={["/projects?q=major"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Major Scale Lab" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Color Picker Game" })).toBeNull();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "color picker" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(screen.getByRole("heading", { name: "Color Picker Game" })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("color picker");
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    const projects = within(screen.getByRole("region", { name: "프로젝트 목록" }));
    expect(projects.getAllByRole("article")).toHaveLength(listProjects().length);
    expect(projects.getByRole("heading", { name: "Major Scale Lab" })).toBeTruthy();
    expect(projects.getByRole("heading", { name: "YBrary" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "프로젝트 헤일메리" })).toBeNull();
  });

  it("프로젝트 전용 목록과 검색은 /projects에 유지한다", () => {
    render(<MemoryRouter initialEntries={["/projects?q=major"]}><App /></MemoryRouter>);
    expect(document.title).toBe("프로젝트 | YBrary");
    expect(screen.getByRole("heading", { name: "Major Scale Lab" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "프로젝트 헤일메리" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(8);
  });

  it("프로젝트 태그와 검색어를 함께 적용하고 초기화로 두 조건을 해제한다", () => {
    render(<MemoryRouter initialEntries={["/projects"]}><App /><CurrentLocation /></MemoryRouter>);
    const taggedProjects = listProjects("", { tag: "React" });
    expect(taggedProjects.length).toBeGreaterThan(0);
    const tags = within(screen.getByRole("navigation", { name: "프로젝트 태그" }));
    const reactTag = tags.getByRole("link", { name: /^React/ });
    expect(reactTag.textContent).toContain(String(taggedProjects.length));
    fireEvent.click(reactTag);

    function currentParams() {
      return new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test").searchParams;
    }
    expect(currentParams().get("tag")).toBe("React");
    expect(within(screen.getByRole("region", { name: "프로젝트 목록" })).getAllByRole("article"))
      .toHaveLength(taggedProjects.length);

    const query = "worst";
    const matchingProjects = listProjects(query, { tag: "React" });
    expect(matchingProjects.length).toBeGreaterThan(0);
    expect(matchingProjects.length).toBeLessThan(taggedProjects.length);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: query } });
    fireEvent.submit(screen.getByRole("search"));
    expect(currentParams().get("tag")).toBe("React");
    expect(currentParams().get("q")).toBe(query);
    const results = within(screen.getByRole("region", { name: "프로젝트 목록" }));
    expect(results.getAllByRole("article")).toHaveLength(matchingProjects.length);
    for (const project of matchingProjects) expect(results.getByRole("heading", { name: project.title })).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(currentParams().get("tag")).toBeNull();
    expect(currentParams().get("q")).toBeNull();
    expect(within(screen.getByRole("region", { name: "프로젝트 목록" })).getAllByRole("article"))
      .toHaveLength(listProjects().length);
    expect(tags.getByRole("link", { name: /^React/ }).getAttribute("aria-current")).toBeNull();
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
