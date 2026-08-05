import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다.");
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
const localImageSchema = z.object({
  source: z.string().min(1),
  alt: z.string().min(1).max(200),
});

const projectManifestSchema = z.object({
  kind: z.literal("project"),
  slug: slugSchema,
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  description: z.string().min(1).max(2000),
  thumbnail: localImageSchema,
  screenshots: z
    .array(
      localImageSchema.extend({
        caption: z.string().max(300).optional(),
      }),
    )
    .min(1)
    .max(6),
  githubUrl: z.url().nullable().default(null),
  liveUrl: z.url().nullable().default(null),
  publishedAt: dateSchema,
});

const reviewManifestSchema = z.object({
  kind: z.enum(["book", "film"]),
  slug: slugSchema,
  title: z.string().min(1).max(200),
  creator: z.string().min(1).max(200),
  consumedOn: dateSchema,
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  summary: z.string().min(1).max(300),
  body: z.string().min(1).max(2000),
  cover: localImageSchema,
  publishedAt: dateSchema,
});

export const contentManifestSchema = z.discriminatedUnion("kind", [
  projectManifestSchema,
  reviewManifestSchema,
]);

export type ContentManifest = z.infer<typeof contentManifestSchema>;
export type ProjectManifest = z.infer<typeof projectManifestSchema>;
export type ReviewManifest = z.infer<typeof reviewManifestSchema>;

export interface ResolvedAsset {
  alt: string;
  caption?: string;
  source: string;
  sourcePath: string;
  size: number;
}

export interface LoadedManifest {
  assets: ResolvedAsset[];
  manifest: ContentManifest;
  manifestPath: string;
}

export async function loadManifest(inputPath: string): Promise<LoadedManifest> {
  const manifestPath = resolve(inputPath);
  const raw = await readFile(manifestPath, "utf8");
  const manifest = contentManifestSchema.parse(JSON.parse(raw));
  const baseDirectory = dirname(manifestPath);
  const declaredAssets =
    manifest.kind === "project" ? [manifest.thumbnail, ...manifest.screenshots] : [manifest.cover];

  const assets = await Promise.all(
    declaredAssets.map(async (asset) => {
      const sourcePath = resolve(baseDirectory, asset.source);
      const file = await stat(sourcePath);

      if (!file.isFile()) {
        throw new Error(`이미지 경로가 파일이 아닙니다: ${asset.source}`);
      }

      return {
        ...asset,
        sourcePath,
        size: file.size,
      };
    }),
  );

  return { assets, manifest, manifestPath };
}

export function resolveManifestArgument(arguments_: string[]) {
  const manifestPath = arguments_.find((argument) => !argument.startsWith("--"));

  if (!manifestPath) {
    throw new Error("콘텐츠 manifest JSON 경로를 입력하세요.");
  }

  return manifestPath;
}

export function toPublishedTimestamp(date: string) {
  return `${date}T00:00:00+09:00`;
}
