// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MarkdownContent } from "@/components/markdown-content";
import { ReviewDetail } from "@/components/review-detail";
import { reviews } from "@/lib/content/static-data";
import { reviewSchema } from "@/lib/content/schema";
import { ProjectDetailPage } from "@/pages/project-detail";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("공통 Markdown 본문", () => {
  it("제목, 강조, 목록, 인용과 코드를 의미에 맞는 요소로 표시한다", () => {
    const source = [
      "## 주요 개념", "", "**중요한 내용**과 *덧붙임*, `value`", "",
      "- 첫 번째", "- 두 번째", "", "1. 준비", "2. 실행", "",
      "> 기억할 문장", "", "```ts", "const value = 1;", "```",
    ].join("\n");
    const { container } = render(<MarkdownContent>{source}</MarkdownContent>);

    expect(screen.getByRole("heading", { level: 2, name: "주요 개념" })).toBeTruthy();
    expect(screen.getByText("중요한 내용").tagName).toBe("STRONG");
    expect(screen.getByText("덧붙임").tagName).toBe("EM");
    expect(screen.getByText("value").tagName).toBe("CODE");
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(container.querySelector("ul")).toBeTruthy();
    expect(container.querySelector("ol")).toBeTruthy();
    expect(screen.getByText("기억할 문장").closest("blockquote")).toBeTruthy();
    expect(screen.getByText("const value = 1;").closest("pre")).toBeTruthy();
  });

  it("표와 읽기 전용 체크리스트를 표시하며 단일 물결표는 유지한다", () => {
    const source = [
      "| 항목 | 상태 |", "| --- | --- |", "| Markdown | 완료 |", "",
      "- [x] 확인 완료", "- [ ] 다음 작업", "", "1~5점, 4~5월과 ~~취소한 문장~~",
    ].join("\n");
    const { container } = render(<MarkdownContent>{source}</MarkdownContent>);

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "항목" })).toBeTruthy();
    expect(within(table).getByRole("cell", { name: "완료" })).toBeTruthy();
    expect(table.parentElement?.className).toBe("markdown-table-scroll");
    const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
    expect(checkboxes.map((checkbox) => checkbox.checked)).toEqual([true, false]);
    expect(checkboxes.every((checkbox) => checkbox.disabled)).toBe(true);
    expect(screen.getByText(/1~5점, 4~5월/).textContent).toContain("1~5점, 4~5월");
    expect(container.querySelectorAll("del")).toHaveLength(1);
    expect(screen.getByText("취소한 문장").tagName).toBe("DEL");
  });

  it("빈 줄을 문단으로 나누고 명시적인 줄바꿈만 br로 표시한다", () => {
    const { container } = render(
      <MarkdownContent>{"첫 문장의 앞부분\n이어지는 뒷부분\n\n다음 문단  \n명시적인 줄바꿈"}</MarkdownContent>,
    );
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe("첫 문장의 앞부분\n이어지는 뒷부분");
    expect(paragraphs[0].querySelector("br")).toBeNull();
    expect(paragraphs[1].querySelectorAll("br")).toHaveLength(1);
  });

  it("원시 HTML과 실행 가능한 링크를 본문에서 실행하지 않는다", () => {
    const source = [
      '<script>alert("실행 금지")</script>', "",
      '<img src="/unsafe.webp" onerror="alert(1)">', "",
      "[위험한 링크](javascript:alert%281%29)", "",
      "[정상 링크](https://example.com/reference)",
    ].join("\n");
    const { container } = render(<MarkdownContent>{source}</MarkdownContent>);

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("위험한 링크").getAttribute("href")).toBe("");
    expect(screen.getByRole("link", { name: "정상 링크" }).getAttribute("href"))
      .toBe("https://example.com/reference");
  });

  it("하위 경로 배포에서도 루트 이미지·링크를 보정하고 외부·앵커 주소는 유지한다", () => {
    vi.stubEnv("BASE_URL", "/y-brary/");
    const source = [
      "![설명 이미지](/content/example.webp)", "",
      "[프로젝트](/projects/example)", "",
      "[외부 문서](https://example.com/docs)", "",
      "[바로가기](#section)",
    ].join("\n");
    render(<MarkdownContent>{source}</MarkdownContent>);

    expect(screen.getByRole("img", { name: "설명 이미지" }).getAttribute("src"))
      .toBe("/y-brary/content/example.webp");
    expect(screen.getByRole("link", { name: "프로젝트" }).getAttribute("href"))
      .toBe("/y-brary/projects/example");
    expect(screen.getByRole("link", { name: "외부 문서" }).getAttribute("href"))
      .toBe("https://example.com/docs");
    expect(screen.getByRole("link", { name: "바로가기" }).getAttribute("href")).toBe("#section");
  });
});

describe("상세 화면의 Markdown 연결", () => {
  it("기존 프로젝트 설명의 소제목과 기능 목록을 렌더링한다", () => {
    render(<MemoryRouter><ProjectDetailPage slug="jev-playground" /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 2, name: "주요 데모" })).toBeTruthy();
    const feature = screen.getByText("마법의 소라고동은 사용자의 고민을 바탕으로 Yes 또는 No를 선택합니다.");
    expect(feature.closest("li")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "구현 및 화면 안내" })).toBeTruthy();
  });

  it("기존 책 본문의 소제목과 필사를 인용문으로 렌더링한다", () => {
    const book = reviews.find((review) => review.slug === "get-out-of-my-head")!;
    const { container } = render(<MemoryRouter><ReviewDetail review={book} /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 2, name: "필사" })).toBeTruthy();
    expect(container.querySelector("blockquote")?.textContent).toContain("그들은 오직 실천할 뿐이다.");
    expect(screen.getByText("표지 출처:").tagName).toBe("STRONG");
  });

  it("강의 후기에도 Markdown을 적용하며 메타데이터는 일반 텍스트로 유지한다", () => {
    const course = reviewSchema.parse({
      id: "markdown-course", kind: "course", slug: "markdown-course", title: "테스트 강의",
      creator: "테스트 강사", consumedOn: "2026-10-27", rating: 4,
      summary: "**그대로 표시할 요약**", body: "## 배운 내용\n\n- **타입 이해**\n- 실습 진행",
      cover: null, publishedAt: "2026-10-27", isSample: true,
    });
    render(<MemoryRouter><ReviewDetail review={course} /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 2, name: "배운 내용" })).toBeTruthy();
    expect(screen.getByText("타입 이해").tagName).toBe("STRONG");
    expect(screen.getByText("실습 진행").closest("li")).toBeTruthy();
    expect(screen.getByText(course.summary).querySelector("strong")).toBeNull();
  });
});
