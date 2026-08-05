import { relative } from "node:path";

import { ZodError } from "zod";

import { loadManifest, resolveManifestArgument } from "./manifest.ts";

async function main() {
  const loaded = await loadManifest(resolveManifestArgument(process.argv.slice(2)));
  const { manifest } = loaded;

  console.log("YBrary 콘텐츠 게시 미리보기");
  console.log(`- 종류: ${manifest.kind}`);
  console.log(`- slug: ${manifest.slug}`);
  console.log(`- 제목: ${manifest.title}`);
  console.log(`- 공개일: ${manifest.publishedAt}`);
  console.log(`- 요약: ${manifest.summary}`);
  console.log(`- 본문 길이: ${manifest.kind === "project" ? manifest.description.length : manifest.body.length}자`);
  console.log("- 이미지:");

  for (const asset of loaded.assets) {
    console.log(`  - ${relative(process.cwd(), asset.sourcePath)} (${asset.size.toLocaleString("ko-KR")} bytes)`);
    console.log(`    대체 텍스트: ${asset.alt}`);
  }

  console.log("\n검토가 끝난 뒤에만 content:publish 명령에 --approved를 붙여 실행하세요.");
}

main().catch((error: unknown) => {
  if (error instanceof ZodError) {
    console.error("manifest 검증에 실패했습니다.");
    console.error(error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`).join("\n"));
  } else {
    console.error(error instanceof Error ? error.message : error);
  }

  process.exitCode = 1;
});
