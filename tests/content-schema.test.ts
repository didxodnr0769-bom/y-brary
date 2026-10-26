import { describe, expect, it } from "vitest";

import { learningNoteSchema, projectSchema, reviewSchema } from "@/lib/content/schema";
import { contentManifestSchema } from "../scripts/content/manifest.ts";

const validReview = {
  id: "review-1",
  kind: "book" as const,
  slug: "review-one",
  title: "리뷰",
  creator: "저자",
  consumedOn: "2026-08-05",
  rating: 4.5,
  summary: "한 줄 감상",
  body: "상세 감상",
  cover: { url: "/cover.svg", alt: "표지" },
  publishedAt: "2026-08-05",
  isSample: false,
};

describe("reviewSchema", () => {
  it("0.5 단위 별점을 허용한다", () => {
    expect(reviewSchema.parse(validReview).rating).toBe(4.5);
  });

  it("0.5 단위가 아닌 별점을 거부한다", () => {
    expect(() => reviewSchema.parse({ ...validReview, rating: 4.2 })).toThrow();
  });

  it("2,000자를 넘는 상세 감상을 거부한다", () => {
    expect(() => reviewSchema.parse({ ...validReview, body: "가".repeat(2001) })).toThrow();
  });

  it("책의 독서 시작일과 읽은 곳을 보존하고 시작일이 없는 기존 기록도 허용한다", () => {
    const book = reviewSchema.parse({ ...validReview, startedOn: "2026-07-05", readingSource: "직접 소장" });
    expect(book).toMatchObject({ startedOn: "2026-07-05", readingSource: "직접 소장" });
    expect(reviewSchema.safeParse(validReview).success).toBe(true);
    expect(reviewSchema.safeParse({ ...validReview, startedOn: null }).success).toBe(true);
  });

  it("완독일보다 늦은 독서 시작일을 거부한다", () => {
    expect(() => reviewSchema.parse({ ...validReview, startedOn: "2026-08-06" })).toThrow("독서 시작일은 완독일보다 늦을 수 없습니다.");
    expect(reviewSchema.safeParse({ ...validReview, startedOn: validReview.consumedOn }).success).toBe(true);
  });

  it("강의는 이미지 없이 플랫폼을 기록하고 책은 표지를 유지한다", () => {
    const course = reviewSchema.parse({ ...validReview, kind: "course", cover: null, platform: "학습 플랫폼" });
    expect(course.cover).toBeNull();
    expect(course.kind === "course" && course.platform).toBe("학습 플랫폼");
    expect(reviewSchema.safeParse({ ...validReview, cover: null }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...validReview, kind: "film" }).success).toBe(false);
  });
});

describe("learningNoteSchema", () => {
  const note = {
    id: "test-note", slug: "test-note", title: "테스트용 학습 정리",
    summary: "테스트 데이터", body: "개념과 실습을 정리합니다.",
    studiedOn: "2026-10-26", publishedAt: "2026-10-26",
  };

  it("이미지와 별점 없이 긴 학습 본문을 허용한다", () => {
    expect(learningNoteSchema.parse({ ...note, body: "가".repeat(20000) }).tags).toEqual([]);
    expect(learningNoteSchema.safeParse({ ...note, body: "가".repeat(20001) }).success).toBe(false);
  });

  it("빈 본문과 과도한 태그를 거부한다", () => {
    expect(learningNoteSchema.safeParse({ ...note, body: "" }).success).toBe(false);
    expect(learningNoteSchema.safeParse({ ...note, tags: Array(9).fill("주제") }).success).toBe(false);
    expect(learningNoteSchema.safeParse({ ...note, tags: ["가".repeat(31)] }).success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("이미지가 아직 없는 프로젝트를 허용한다", () => {
    const project = projectSchema.parse({
      id: "project-ybrary",
      slug: "ybrary",
      title: "YBrary",
      summary: "개인 아카이브",
      description: "프로젝트와 책·영화 기록을 정리합니다.",
      thumbnail: null,
      screenshots: [],
      githubUrl: "https://github.com/didxodnr0769-bom/y-brary",
      liveUrl: null,
      period: null,
      publishedAt: "2026-08-06",
      isSample: false,
    });

    expect(project.thumbnail).toBeNull();
    expect(project.screenshots).toEqual([]);
  });

  it("프로젝트 종료일이 시작일보다 빠르면 거부한다", () => {
    expect(() =>
      projectSchema.parse({
        id: "project-period",
        slug: "project-period",
        title: "기간 검증",
        summary: "프로젝트 기간을 검증합니다.",
        description: "종료일은 시작일보다 빠를 수 없습니다.",
        thumbnail: null,
        screenshots: [],
        githubUrl: null,
        liveUrl: null,
        period: { startedAt: "2026-08-06", endedAt: "2026-08-05" },
        publishedAt: "2026-08-06",
        isSample: false,
      }),
    ).toThrow("프로젝트 종료일은 시작일보다 빠를 수 없습니다.");
  });

  it("프로젝트 태그를 최대 8개까지 허용한다", () => {
    const project = projectSchema.parse({
      id: "project-tags",
      slug: "project-tags",
      title: "태그 검증",
      summary: "프로젝트 태그를 검증합니다.",
      description: "프로젝트의 주제를 나타내는 태그입니다.",
      thumbnail: null,
      screenshots: [],
      githubUrl: null,
      liveUrl: null,
      tags: ["화성학", "피아노", "음악"],
      period: null,
      publishedAt: "2026-08-06",
      isSample: false,
    });

    expect(project.tags).toEqual(["화성학", "피아노", "음악"]);
    expect(() => projectSchema.parse({ ...project, tags: Array.from({ length: 9 }, (_, index) => `태그${index}`) })).toThrow();
  });
});

describe("contentManifestSchema", () => {
  it("승인 전 파일 형식에서 이미지 원본 경로를 검증한다", () => {
    const result = contentManifestSchema.safeParse({
      kind: "film",
      slug: "film-one",
      title: "영화",
      creator: "감독",
      consumedOn: "2026-08-05",
      rating: 5,
      summary: "한 줄 감상",
      body: "상세 감상",
      cover: { source: "./poster.png", alt: "영화 포스터" },
      publishedAt: "2026-08-05",
    });

    expect(result.success).toBe(true);
  });
});
