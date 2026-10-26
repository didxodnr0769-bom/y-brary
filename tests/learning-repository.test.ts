import { describe, expect, it, vi } from "vitest";

import { getLearningNoteBySlug, getReviewBySlug, listLearningNotes, listReviews } from "@/lib/content/repository";

vi.mock("@/lib/content/static-data", () => ({
  projects: [],
  reviews: [
    { id: "book", kind: "book", slug: "shared", title: "기존 책", consumedOn: "2026-10-26" },
    { id: "old-course", kind: "course", slug: "shared", title: "TypeScript 기초", consumedOn: "2026-10-01" },
    { id: "new-course", kind: "course", slug: "new-course", title: "TypeScript 심화", consumedOn: "2026-10-25" },
  ],
}));

vi.mock("@/lib/content/notes", () => ({
  learningNotes: [
    { id: "old-note", slug: "old-note", title: "타입 정리", tags: ["TypeScript"], studiedOn: "2026-10-01" },
    { id: "new-note", slug: "new-note", title: "React 실습", tags: ["UI"], studiedOn: "2026-10-25" },
  ],
}));

describe("강의와 학습 정리 조회", () => {
  it("강의 검색은 책을 제외하고 수강일 최신순으로 제공한다", async () => {
    expect((await listReviews("course", " TYPESCRIPT ")).map((item) => item.id)).toEqual(["new-course", "old-course"]);
    await expect(getReviewBySlug("course", "shared")).toMatchObject({ id: "old-course" });
  });

  it("학습 정리를 최신순으로 제공하고 제목 또는 태그로 검색한다", async () => {
    expect((await listLearningNotes()).map((item) => item.id)).toEqual(["new-note", "old-note"]);
    await expect(listLearningNotes(" typescript ")).toMatchObject([{ id: "old-note" }]);
    await expect(listLearningNotes("React")).toMatchObject([{ id: "new-note" }]);
    await expect(listLearningNotes("없는 기록")).toEqual([]);
    await expect(getLearningNoteBySlug("new-note")).toMatchObject({ id: "new-note" });
    await expect(getLearningNoteBySlug("missing")).toBeNull();
  });
});
