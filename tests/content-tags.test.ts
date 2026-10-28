import { describe, expect, it, vi } from "vitest";

import { learningNotes } from "@/lib/content/notes";
import { projects, reviews } from "@/lib/content/static-data";
import { contentTags, listContentTags } from "@/lib/content/tags";

vi.mock("@/lib/content/static-data", () => ({
  projects: [
    { tags: ["React", "React", "가"] },
    { tags: ["React", "나"] },
    { tags: ["react"] },
  ],
  reviews: [
    { kind: "book", category: "React" },
    { kind: "book", category: "SF" },
    { kind: "book", category: "SF" },
    { kind: "book" },
    { kind: "course", platform: "React" },
  ],
}));

vi.mock("@/lib/content/notes", () => ({
  learningNotes: [{ tags: ["React", "React", "나"] }],
}));

describe("콘텐츠 태그 집계", () => {
  it("프로젝트·학습 태그와 책 카테고리를 사용하고 강의 플랫폼은 태그로 만들지 않는다", () => {
    expect(contentTags(projects[0])).toEqual(["React", "React", "가"]);
    expect(contentTags(learningNotes[0])).toEqual(["React", "React", "나"]);
    expect(contentTags(reviews[1])).toEqual(["SF"]);
    expect(contentTags(reviews[3])).toEqual([]);
    expect(contentTags(reviews[4])).toEqual([]);
  });

  it("같은 기록의 중복 태그는 한 번만 세고 빈도순·동률 이름순으로 제공한다", () => {
    expect(listContentTags()).toEqual([
      { tag: "React", count: 4 },
      { tag: "나", count: 2 },
      { tag: "SF", count: 2 },
      { tag: "가", count: 1 },
      { tag: "react", count: 1 },
    ]);
    expect(projects[0].tags).toEqual(["React", "React", "가"]);
  });

  it("종류별 빈도를 따로 제공하며 태그의 원래 대소문자를 유지한다", () => {
    expect(listContentTags("project")).toEqual([
      { tag: "React", count: 2 },
      { tag: "가", count: 1 },
      { tag: "나", count: 1 },
      { tag: "react", count: 1 },
    ]);
    expect(listContentTags("book")).toEqual([{ tag: "SF", count: 2 }, { tag: "React", count: 1 }]);
    expect(listContentTags("note")).toEqual([{ tag: "나", count: 1 }, { tag: "React", count: 1 }]);
    expect(listContentTags("course")).toEqual([]);
  });
});
