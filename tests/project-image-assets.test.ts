import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { projects } from "@/lib/content/static-data";

describe("프로젝트 이미지 파일", () => {
  it("반응형 후보의 선언된 너비가 실제 파일 픽셀과 일치하고 상세 원본을 포함한다", async () => {
    const assets = projects.flatMap((project) => [project.thumbnail, ...project.screenshots])
      .filter((image) => image?.sources?.length);

    expect(assets.length).toBeGreaterThan(0);
    for (const asset of assets) {
      const sources = asset!.sources!;
      expect(sources.some((source) => source.url === asset!.url)).toBe(true);
      expect(new Set(sources.map((source) => source.width)).size).toBe(sources.length);
      for (const source of sources) {
        const metadata = await sharp(path.join(process.cwd(), "public", source.url)).metadata();
        expect(metadata.width, source.url).toBe(source.width);
      }
    }
  });
});
