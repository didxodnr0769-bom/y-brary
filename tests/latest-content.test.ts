import { describe, expect, it, vi } from "vitest";

import { listLatestContent } from "@/lib/content/repository";

vi.mock("@/lib/content/static-data", () => ({
  projects: [{ id: "test-project", slug: "test-project", title: "테스트 프로젝트", summary: "프로젝트 요약", tags: ["React"], publishedAt: "2026-10-01", thumbnail: null, isSample: true }],
  reviews: [
    { id: "test-book", kind: "book", slug: "test-book", title: "테스트 책", creator: "테스트 저자", category: "SF", summary: "책 요약", consumedOn: "2025-01-01", publishedAt: "2026-10-03", cover: { url: "/book.webp", alt: "테스트 책 표지" }, isSample: true },
    { id: "test-course", kind: "course", slug: "test-course", title: "테스트 강의", creator: "테스트 강사", platform: "학습 플랫폼", summary: "강의 요약", publishedAt: "2026-10-02", cover: null, isSample: true },
  ],
}));

vi.mock("@/lib/content/notes", () => ({
  learningNotes: [{ id: "test-note", slug: "test-note", title: "테스트 학습 정리", summary: "정리 요약", tags: ["TypeScript"], studiedOn: "2026-01-01", publishedAt: "2026-10-03", isSample: true }],
}));

describe("통합 최신 기록", () => {
  it("완독일이나 학습일 대신 게시일로 모든 종류를 함께 정렬한다", () => {
    const entries = listLatestContent();
    expect(entries.map((entry) => entry.kind)).toEqual(["book", "note", "course", "project"]);
    expect(entries.map((entry) => entry.href)).toEqual(["/books/test-book", "/notes/test-note", "/courses/test-course", "/projects/test-project"]);
    expect(listLatestContent().map((entry) => entry.id)).toEqual(entries.map((entry) => entry.id));
  });

  it("각 종류의 제목, 태그, 저자, 카테고리와 플랫폼으로 검색한다", () => {
    expect(listLatestContent("  react  ").map((entry) => entry.kind)).toEqual(["project"]);
    expect(listLatestContent("테스트 저자").map((entry) => entry.kind)).toEqual(["book"]);
    expect(listLatestContent("SF").map((entry) => entry.kind)).toEqual(["book"]);
    expect(listLatestContent("학습 플랫폼").map((entry) => entry.kind)).toEqual(["course"]);
    expect(listLatestContent("TypeScript").map((entry) => entry.kind)).toEqual(["note"]);
    expect(listLatestContent("없는 기록")).toEqual([]);
  });

  it("표지가 있는 책과 이미지가 없는 기록을 같은 카드 계약으로 제공한다", () => {
    const entries = listLatestContent();
    expect(entries.find((entry) => entry.kind === "book")?.image).toEqual({ url: "/book.webp", alt: "테스트 책 표지" });
    expect(entries.find((entry) => entry.kind === "note")?.image).toBeNull();
    expect(entries.find((entry) => entry.kind === "project")?.image).toBeNull();
  });
});
