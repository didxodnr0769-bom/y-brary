import { describe, expect, it } from "vitest";

import { formatDateRange } from "@/lib/content/format";

describe("formatDateRange", () => {
  it("서로 다른 시작일과 종료일을 기간으로 표시한다", () => {
    expect(formatDateRange("2026-08-05", "2026-08-06")).toBe(
      "2026. 08. 05. – 2026. 08. 06.",
    );
  });

  it("시작일과 종료일이 같으면 날짜를 한 번만 표시한다", () => {
    expect(formatDateRange("2026-08-06", "2026-08-06")).toBe("2026. 08. 06.");
  });
});
