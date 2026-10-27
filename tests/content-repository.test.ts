import { describe, expect, it } from "vitest";

import {
  getProjectBySlug,
  getLearningNoteBySlug,
  getReviewBySlug,
  listProjects,
  listLearningNotes,
  listReviews,
} from "@/lib/content/repository";

describe("static content repository", () => {
  it("등록된 실제 프로젝트를 최신순 목록에 제공한다", async () => {
    const projects = await listProjects();

    expect(projects.map((project) => project.slug)).toEqual([
      "jev-playground",
      "worstcompare",
      "deskmate",
      "svn-workspace",
      "color-picker-game",
      "major-scale-lab",
      "ybrary",
    ]);
    expect(projects.every((project) => !project.isSample)).toBe(true);
  });

  it("프로젝트 제목을 공백과 대소문자에 관계없이 검색한다", async () => {
    await expect(listProjects("  YBRARY  ")).toHaveLength(1);
    await expect(listProjects("color picker")).toMatchObject([
      { slug: "color-picker-game" },
    ]);
    await expect(listProjects("major scale")).toMatchObject([{ slug: "major-scale-lab" }]);
    await expect(listProjects("없는 프로젝트")).toEqual([]);
  });

  it("프로젝트 태그로 검색한다", async () => {
    await expect(listProjects("화성학")).toMatchObject([{ slug: "major-scale-lab" }]);
    await expect(listProjects("리뷰 사이트")).toMatchObject([{ slug: "ybrary" }]);
  });

  it("slug로 프로젝트를 조회하고 없는 항목은 null을 반환한다", async () => {
    await expect(getProjectBySlug("ybrary")).toMatchObject({
      title: "YBrary",
      githubUrl: null,
      tags: ["포트폴리오", "와이브러리", "리뷰 사이트"],
    });
    await expect(getProjectBySlug("major-scale-lab")).toMatchObject({
      title: "Major Scale Lab",
      screenshots: expect.arrayContaining([
        expect.objectContaining({ id: "major-scale-result-detail" }),
      ]),
    });
    await expect(getProjectBySlug("color-picker-game")).toMatchObject({
      title: "Color Picker Game",
      liveUrl: "https://didxodnr0769-bom.github.io/color-picker-game/",
      screenshots: expect.arrayContaining([
        expect.objectContaining({ id: "color-picker-game-round-results" }),
      ]),
    });
    await expect(getProjectBySlug("missing-project")).toBeNull();
  });

  it("등록된 실제 책을 제공하고 샘플과 미등록 기록은 제공하지 않는다", async () => {
    await expect(listReviews("book")).toMatchObject([
      { slug: "the-sorrows-of-young-werther", isSample: false },
      { slug: "the-martian", isSample: false },
      { slug: "project-hail-mary", isSample: false },
      { slug: "get-out-of-my-head", isSample: false },
      { slug: "ebs-capitalism", isSample: false },
      { slug: "harvard-debate-class", isSample: false },
    ]);
    await expect(listReviews("course")).toEqual([]);
    await expect(getReviewBySlug("book", "book-review-example-one")).toBeNull();
    await expect(getReviewBySlug("course", "missing-course")).toBeNull();
    await expect(listLearningNotes()).toEqual([]);
    await expect(getLearningNoteBySlug("missing-note")).toBeNull();
  });
});
