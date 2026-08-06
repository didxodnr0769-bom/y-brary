// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/empty-state";

describe("EmptyState", () => {
  it("검색어가 없으면 아직 등록된 기록이 없다고 안내한다", () => {
    render(<EmptyState query="" label="책 리뷰" />);

    expect(screen.getByText("아직 등록된 책 리뷰가 없습니다.")).toBeDefined();
    expect(screen.getByText("새 기록이 추가되면 이곳에서 확인할 수 있습니다.")).toBeDefined();
  });

  it("검색어가 있으면 일치하는 결과가 없다고 안내한다", () => {
    render(<EmptyState query="없는 책" label="책 리뷰" />);

    expect(screen.getByText("일치하는 책 리뷰가 없습니다.")).toBeDefined();
    expect(screen.getByText("“없는 책” 대신 다른 제목 키워드로 검색해보세요.")).toBeDefined();
  });
});
