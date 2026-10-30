// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app";
import { listReviews } from "@/lib/content/repository";
import { openBookTransition } from "@/lib/book-transition";

vi.mock("@/lib/book-transition", () => ({ openBookTransition: vi.fn((_image, navigate) => { navigate(); return Promise.resolve(); }) }));

vi.mock("@/lib/content/static-data", () => {
  const common = {
    consumedOn: "2026-10-25", rating: 4, summary: "테스트용 요약", body: "테스트용 감상",
    cover: { url: "/test-cover.webp", alt: "테스트 표지" },
    publishedAt: "2026-10-26", isSample: true,
  };
  return {
    projects: [],
    reviews: [
      { ...common, id: "book-a", kind: "book", slug: "book-a", title: "테스트 고전 기록", creator: "테스트 작가", category: "고전소설" },
      { ...common, id: "book-b", kind: "book", slug: "book-b", title: "다른 고전 기록", creator: "다른 작가", category: "고전소설" },
      { ...common, id: "book-c", kind: "book", slug: "book-c", title: "테스트 수필 기록", creator: "테스트 작가", category: "에세이" },
      { ...common, id: "book-d", kind: "book", slug: "book-d", title: "분류 없는 기록", creator: "다른 작가" },
      { ...common, id: "course-a", kind: "course", slug: "course-a", title: "테스트 강의", creator: "테스트 강사", cover: null },
    ],
  };
});

function CurrentLocation() {
  const location = useLocation();
  return <output aria-label="현재 경로">{location.pathname}{location.search}</output>;
}

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /><CurrentLocation /></MemoryRouter>);
}

beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("책 분류 탐색", () => {
  it("책 표지 전환을 실행하고 움직임 줄이기에서는 일반 이동한다", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: vi.fn() });
    const view = render(<MemoryRouter initialEntries={["/books"]} useTransitions={false}><App /></MemoryRouter>);
    const image = within(screen.getByRole("link", { name: /테스트 고전 기록/ })).getByRole("img");
    Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 300 } });
    fireEvent.click(screen.getByRole("link", { name: /테스트 고전 기록/ }));
    expect(openBookTransition).toHaveBeenCalledOnce();
    view.unmount();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    render(<MemoryRouter initialEntries={["/books"]} useTransitions={false}><App /></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: /테스트 고전 기록/ }));
    expect(screen.getByRole("heading", { name: "테스트 고전 기록", level: 1 })).toBeTruthy();
    expect(openBookTransition).toHaveBeenCalledOnce();
    delete (Element.prototype as unknown as { animate?: unknown }).animate;
  });
  it("제목과 저자 부분 검색을 카테고리 조건과 함께 적용한다", () => {
    expect(listReviews("book", "  테스트 작가  ", { category: "고전소설" }).map((book) => book.slug)).toEqual(["book-a"]);
    expect(listReviews("book", "작가")).toHaveLength(4);
    expect(listReviews("book", "기록", { category: "고전소설", author: "테스트 작가" }).map((book) => book.slug)).toEqual(["book-a"]);
    expect(listReviews("book", "수필", { category: "고전소설" })).toEqual([]);
    expect(listReviews("book", "", { category: "고전" })).toEqual([]);
  });

  it("책 전용 조건과 저자 검색 확대가 강의 제목 검색에는 영향을 주지 않는다", () => {
    expect(listReviews("course", "테스트", { category: "고전소설", author: "다른 작가" }).map((course) => course.slug)).toEqual(["course-a"]);
    expect(listReviews("course", "테스트 강사")).toEqual([]);
  });

  it("URL의 검색 조건을 복원하고 저자 드롭다운 없이 카테고리와 빈도 태그를 제공한다", () => {
    renderAt(`/books?${new URLSearchParams({ q: "테스트 작가", category: "고전소설" })}`);
    expect(screen.getByRole<HTMLInputElement>("searchbox", { name: "책 제목 또는 저자 검색" }).value).toBe("테스트 작가");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("고전소설");
    expect(screen.queryByRole("combobox", { name: "저자" })).toBeNull();
    expect(screen.getByRole("option", { name: "에세이" })).toBeTruthy();
    const tags = within(screen.getByRole("navigation", { name: "책 카테고리 태그" }));
    expect(tags.getAllByRole("link").map((link) => link.textContent?.replace(/\s+/g, " ").trim())).toEqual(["전체 4", "고전소설 2", "에세이 1"]);
    expect(screen.getByRole("heading", { name: "테스트 고전 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "다른 고전 기록" })).toBeNull();
  });

  it("검색창에서 저자를 검색하고 카테고리와 함께 URL에 보존한다", () => {
    renderAt("/books");
    fireEvent.change(screen.getByRole("searchbox", { name: "책 제목 또는 저자 검색" }), { target: { value: "다른 작가" } });
    fireEvent.change(screen.getByRole("combobox", { name: "카테고리" }), { target: { value: "고전소설" } });
    fireEvent.submit(screen.getByRole("search"));
    const url = new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "다른 작가", category: "고전소설" });
    expect(screen.getByRole("heading", { name: "다른 고전 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "테스트 고전 기록" })).toBeNull();
  });

  it("카테고리 태그는 검색어를 보존해 필터링하고 전체로 돌아가면 카테고리만 해제한다", () => {
    renderAt("/books?q=기록");
    fireEvent.click(within(screen.getByRole("navigation", { name: "책 카테고리 태그" })).getByRole("link", { name: "고전소설 2" }));
    let url = new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "기록", category: "고전소설" });
    expect(within(screen.getByRole("region", { name: "책 리뷰 목록" })).getAllByRole("article")).toHaveLength(2);
    fireEvent.click(within(screen.getByRole("navigation", { name: "책 카테고리 태그" })).getByRole("link", { name: "전체 4" }));
    url = new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "기록" });
    expect(within(screen.getByRole("region", { name: "책 리뷰 목록" })).getAllByRole("article")).toHaveLength(4);
  });

  it("일치하지 않는 분류를 안내하고 초기화로 모든 조건을 해제한다", () => {
    renderAt(`/books?${new URLSearchParams({ q: "없는 제목", category: "없는 분류" })}`);
    expect(screen.getByText("조건에 맞는 책 리뷰가 없습니다.")).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getByLabelText("현재 경로").textContent).toBe("/books");
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("");
    expect(screen.getByRole("heading", { name: "분류 없는 기록" })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "책 리뷰 목록" })).getAllByRole("article")).toHaveLength(4);
  });

  it("분류를 초기화할 때 아직 제출하지 않은 검색어도 비운다", () => {
    renderAt(`/books?${new URLSearchParams({ category: "고전소설" })}`);
    fireEvent.change(screen.getByRole("searchbox", { name: "책 제목 또는 저자 검색" }), { target: { value: "미제출 저자" } });
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getByLabelText("현재 경로").textContent).toBe("/books");
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("");
  });

  it("기존 저자 URL을 검색어로 복원하고 제출하면 q로 전환한다", () => {
    renderAt(`/books?${new URLSearchParams({ author: "테스트 작가" })}`);
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("테스트 작가");
    expect(screen.queryByRole("combobox", { name: "저자" })).toBeNull();
    expect(within(screen.getByRole("region", { name: "책 리뷰 목록" })).getAllByRole("article")).toHaveLength(2);
    fireEvent.submit(screen.getByRole("search"));
    const url = new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "테스트 작가" });
  });

  it("상세 저자 링크는 저자 검색으로, 카테고리 링크는 분류 필터로 연결한다", () => {
    renderAt("/books/book-a");
    const author = screen.getByRole("link", { name: /^테스트 작가$/ });
    const category = screen.getByRole("link", { name: /^고전소설$/ });
    expect(new URL(author.getAttribute("href")!, "https://example.test").searchParams.get("q")).toBe("테스트 작가");
    expect(new URL(category.getAttribute("href")!, "https://example.test").searchParams.get("category")).toBe("고전소설");
    fireEvent.click(author);
    expect(screen.getByRole("heading", { name: "테스트 고전 기록" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "테스트 수필 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "다른 고전 기록" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: /테스트 고전 기록/ }));
    fireEvent.click(screen.getByRole("link", { name: /^고전소설$/ }));
    expect(screen.getByRole("heading", { name: "테스트 고전 기록" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "다른 고전 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "테스트 수필 기록" })).toBeNull();
  });
});
