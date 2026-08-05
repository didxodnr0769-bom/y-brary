import { describe, expect, it } from "vitest";

import { normalizeSearchText, readSearchQuery } from "@/lib/content/search";

describe("search helpers", () => {
  it("앞뒤 공백과 대소문자를 정규화한다", () => {
    expect(normalizeSearchText("  YBrary  ")).toBe("ybrary");
  });

  it("중복 query parameter에서는 첫 값만 사용한다", () => {
    expect(readSearchQuery({ q: ["첫 검색", "두 번째"] })).toBe("첫 검색");
  });

  it("검색어 길이를 80자로 제한한다", () => {
    expect(readSearchQuery({ q: "가".repeat(100) })).toHaveLength(80);
  });
});
