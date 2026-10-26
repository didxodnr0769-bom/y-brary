// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LearningNotesPage } from "@/pages/notes";
import { MemoryRouter } from "react-router-dom";
import { LearningNoteDetailPage } from "@/pages/note-detail";
import { ReviewDetail } from "@/components/review-detail";
import { learningNoteSchema, reviewSchema } from "@/lib/content/schema";
import { getLearningNoteBySlug, listLearningNotes } from "@/lib/content/repository";

vi.mock("@/lib/content/repository", () => ({
  listLearningNotes: vi.fn(),
  getLearningNoteBySlug: vi.fn(),
}));

const note = learningNoteSchema.parse({
  id: "test-note", slug: "test-note", title: "테스트용 개념 정리",
  summary: "개념과 실습 요약", body: "개념을 정리합니다.\n실습으로 확인합니다.",
  tags: ["TypeScript"], studiedOn: "2026-10-26", publishedAt: "2026-10-26", isSample: true,
});

afterEach(cleanup);

describe("학습 콘텐츠 화면", () => {
  it("학습 목록은 제목, 태그와 상세 링크를 제공한다", async () => {
    vi.mocked(listLearningNotes).mockReturnValue([note]);
    render(<MemoryRouter><LearningNotesPage query="TypeScript" /></MemoryRouter>);
    expect(listLearningNotes).toHaveBeenCalledWith("TypeScript");
    expect(screen.getByRole("link", { name: /테스트용 개념 정리/ }).getAttribute("href")).toBe("/notes/test-note");
    expect(screen.getByText("#TypeScript")).toBeTruthy();
    expect(screen.getByText("Sample Note")).toBeTruthy();
  });

  it("학습 상세는 본문과 목록 링크를 제공하며 별점을 표시하지 않는다", async () => {
    vi.mocked(getLearningNoteBySlug).mockReturnValue(note);
    render(<MemoryRouter><LearningNoteDetailPage slug={note.slug} /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(note.title);
    expect(screen.getByText(/개념을 정리합니다/).textContent).toBe(note.body);
    expect(screen.getByRole("link", { name: /학습 정리 목록/ }).getAttribute("href")).toBe("/notes");
    expect(screen.queryByText("별점")).toBeNull();
  });

  it("강의 상세는 이미지 없이 강사, 플랫폼, 수강일과 후기를 표시한다", () => {
    const course = reviewSchema.parse({
      id: "test-course", kind: "course", slug: "test-course", title: "테스트용 강의",
      creator: "테스트 강사", platform: "테스트 플랫폼", consumedOn: "2026-10-26", rating: 4.5,
      summary: "수강 요약", body: "수강 후기 본문", cover: null, publishedAt: "2026-10-26", isSample: true,
    });
    render(<MemoryRouter><ReviewDetail review={course} /></MemoryRouter>);
    expect(screen.getByText("강사")).toBeTruthy();
    expect(screen.getByText("테스트 플랫폼")).toBeTruthy();
    expect(screen.getByText("수강일")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "수강 후기" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "아직 이미지가 첨부되지 않았어요." })).toBeTruthy();
  });

  it("학습 Markdown의 제목, 강조와 코드 블록을 렌더링한다", () => {
    vi.mocked(getLearningNoteBySlug).mockReturnValue({ ...note, body: "## 타입 확인\n\n**중요한 개념**\n\n```ts\nconst value: number = 1;\n```" });
    render(<MemoryRouter><LearningNoteDetailPage slug={note.slug} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "타입 확인" })).toBeTruthy();
    expect(screen.getByText("중요한 개념").tagName).toBe("STRONG");
    expect(screen.getByText("const value: number = 1;").tagName).toBe("CODE");
  });
});
