// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { AppShell } from "@/components/app-shell";

afterEach(cleanup);

function ExternalNavigation() {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate("/books")}>책 경로로 이동</button>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell>
        <Routes>
          <Route path="/" element={<p>홈 콘텐츠</p>} />
          <Route path="/projects" element={<><input type="search" aria-label="프로젝트 검색" /><ExternalNavigation /></>} />
          <Route path="/projects/example" element={<p>프로젝트 상세</p>} />
          <Route path="/books" element={<input type="search" aria-label="책 검색" />} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe("상단 내비게이션", () => {
  it("홈은 캔버스용 셸을 사용하고 다른 화면에서는 기존 푸터를 유지한다", () => {
    const view = renderAt("/");
    expect(view.container.querySelector(".app-layout-graph")).toBeTruthy();
    expect(screen.queryByRole("contentinfo")).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "프로젝트" }));
    expect(view.container.querySelector(".app-layout-graph")).toBeNull();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "메이플스토리 서체 저작권 안내" })).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "홈" }));
    expect(view.container.querySelector(".app-layout-graph")).toBeTruthy();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("상세 경로의 검색 버튼은 같은 종류의 목록 검색으로 이동한다", () => {
    renderAt("/projects/example");
    expect(screen.getByRole("link", { name: "프로젝트" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "기록 검색" }));
    expect(screen.getByRole("searchbox", { name: "프로젝트 검색" })).toBe(document.activeElement);
    expect(screen.getByRole("link", { name: "프로젝트" }).getAttribute("aria-current")).toBe("page");
  });

  it("메뉴를 열면 첫 링크로 초점을 옮기고 Escape로 닫으면 토글로 돌려준다", () => {
    renderAt("/projects");
    fireEvent.click(screen.getByRole("button", { name: "기록 검색" }));
    expect(screen.getByRole("searchbox", { name: "프로젝트 검색" })).toBe(document.activeElement);

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getByRole("navigation", { name: "주요 메뉴" }).getAttribute("data-open")).toBe("true");
    expect(screen.getByRole("link", { name: "홈" })).toBe(document.activeElement);
    fireEvent.keyDown(document, { key: "Escape" });
    const menuButton = screen.getByRole("button", { name: "메뉴 열기" });
    expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    expect(menuButton).toBe(document.activeElement);

    fireEvent.click(menuButton);
    fireEvent.click(screen.getByRole("button", { name: "책 경로로 이동" }));
    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("link", { name: "책" }).getAttribute("aria-current")).toBe("page");
  });

  it("메뉴에서 선택한 목록으로 이동하면 열린 메뉴를 닫는다", () => {
    renderAt("/");
    expect(screen.queryByRole("button", { name: "기록 검색" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    fireEvent.click(screen.getByRole("link", { name: "프로젝트" }));
    expect(screen.getByRole("searchbox", { name: "프로젝트 검색" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "주요 메뉴" }).getAttribute("data-open")).toBe("false");
  });
});
