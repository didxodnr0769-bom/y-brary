import { describe, expect, it } from "vitest";

import { parseLearningNote, parseLearningNotes } from "@/lib/content/note-parser";

const markdown = `---
id: test-note
slug: test-note
title: 테스트용 학습 정리
summary: 테스트용 개념 요약
studiedOn: "2026-10-26"
publishedAt: "2026-10-26"
tags: [TypeScript]
isSample: true
---
## 배운 개념

**타입**을 정리합니다.

\`\`\`ts
const value: number = 1;
\`\`\`
`;

describe("Markdown 학습 기록", () => {
  it("메타데이터와 Markdown 본문을 분리해 검증한다", () => {
    const note = parseLearningNote(markdown, "test-note.md");
    expect(note.title).toBe("테스트용 학습 정리");
    expect(note.tags).toEqual(["TypeScript"]);
    expect(note.body).toContain("## 배운 개념");
    expect(note.body).toContain("```ts");
  });

  it("메타데이터 누락, 파일명 불일치, 중복 기록을 거부한다", () => {
    expect(() => parseLearningNote("본문만 있는 기록", "test-note.md")).toThrow("메타데이터");
    expect(() => parseLearningNote(markdown, "other-note.md")).toThrow("파일명과 slug");
    expect(() => parseLearningNotes({ "test-note.md": markdown, "other-note.md": markdown.replace("slug: test-note", "slug: other-note") })).toThrow("고유");
    expect(() => parseLearningNote(markdown.replace('studiedOn: "2026-10-26"', 'studiedOn: "오늘"'), "test-note.md")).toThrow();
  });
});
