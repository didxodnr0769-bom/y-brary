// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/app";
import { listReviews } from "@/lib/content/repository";

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
afterEach(cleanup);

describe("책 분류 탐색", () => {
  it("제목, 카테고리, 저자를 모두 만족하는 책만 반환한다", () => {
    expect(listReviews("book", "기록", { category: "고전소설", author: "테스트 작가" }).map((book) => book.slug)).toEqual(["book-a"]);
    expect(listReviews("book", "수필", { category: "고전소설", author: "테스트 작가" })).toEqual([]);
    expect(listReviews("book", "", { author: "작가" })).toEqual([]);
    expect(listReviews("book", "", { category: "고전" })).toEqual([]);
    expect(listReviews("book")).toHaveLength(4);
  });

  it("책 전용 필터가 강의 검색에는 영향을 주지 않는다", () => {
    expect(listReviews("course", "테스트", { category: "고전소설", author: "다른 작가" }).map((course) => course.slug)).toEqual(["course-a"]);
    expect(listReviews("course", "없는 강의")).toEqual([]);
  });

  it("URL로 들어온 검색 조건을 복원하고 전체 책에서 선택지를 제공한다", () => {
    const params = new URLSearchParams({ q: "기록", category: "고전소설", author: "테스트 작가" });
    renderAt(`/books?${params}`);
    expect(screen.getByRole<HTMLInputElement>("searchbox", { name: "책 제목 검색" }).value).toBe("기록");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("고전소설");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "저자" }).value).toBe("테스트 작가");
    expect(screen.getByRole("option", { name: "에세이" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "다른 작가" })).toBeTruthy();
    expect(screen.getAllByRole("option", { name: "고전소설" })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "테스트 고전 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "다른 고전 기록" })).toBeNull();
  });

  it("제목과 두 필터를 함께 검색하고 URL에 보존한다", () => {
    renderAt("/books");
    fireEvent.change(screen.getByRole("searchbox", { name: "책 제목 검색" }), { target: { value: "고전" } });
    fireEvent.change(screen.getByRole("combobox", { name: "카테고리" }), { target: { value: "고전소설" } });
    fireEvent.change(screen.getByRole("combobox", { name: "저자" }), { target: { value: "다른 작가" } });
    fireEvent.submit(screen.getByRole("search"));
    const url = new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test");
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "고전", category: "고전소설", author: "다른 작가" });
    expect(screen.getByRole("heading", { name: "다른 고전 기록" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "테스트 고전 기록" })).toBeNull();
  });

  it("일치하지 않는 분류를 안내하고 초기화로 모든 조건을 해제한다", () => {
    renderAt(`/books?${new URLSearchParams({ q: "없는 제목", category: "없는 분류", author: "없는 작가" })}`);
    expect(screen.getByText("조건에 맞는 책 리뷰가 없습니다.")).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getByLabelText("현재 경로").textContent).toBe("/books");
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "저자" }).value).toBe("");
    expect(screen.getByRole("heading", { name: "분류 없는 기록" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
  });

  it("적용된 분류를 초기화할 때 아직 제출하지 않은 제목과 저자도 비운다", () => {
    renderAt(`/books?${new URLSearchParams({ category: "고전소설" })}`);
    fireEvent.change(screen.getByRole("searchbox", { name: "책 제목 검색" }), { target: { value: "미제출 제목" } });
    fireEvent.change(screen.getByRole("combobox", { name: "저자" }), { target: { value: "다른 작가" } });
    fireEvent.click(screen.getByRole("link", { name: "초기화" }));
    expect(screen.getByLabelText("현재 경로").textContent).toBe("/books");
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "카테고리" }).value).toBe("");
    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "저자" }).value).toBe("");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
  });

  it("상세의 카테고리와 저자 링크에서 해당 책들을 모아볼 수 있다", () => {
    renderAt("/books/book-a");
    const author = screen.getByRole("link", { name: /^테스트 작가$/ });
    const category = screen.getByRole("link", { name: /^고전소설$/ });
    expect(new URL(author.getAttribute("href")!, "https://example.test").searchParams.get("author")).toBe("테스트 작가");
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
