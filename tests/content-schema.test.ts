import { describe, expect, it } from "vitest";

import { reviewSchema } from "@/lib/content/schema";
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
