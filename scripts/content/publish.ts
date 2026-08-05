import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { ZodError } from "zod";

import {
  loadManifest,
  resolveManifestArgument,
  toPublishedTimestamp,
  type ContentManifest,
  type LoadedManifest,
} from "./manifest.ts";

interface PreparedAsset {
  buffer: Buffer;
  storagePath: string;
}

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }

  return value;
}

async function optimizeImage(sourcePath: string, width: number) {
  return sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

function hashedStoragePath(prefix: string, label: string, buffer: Buffer) {
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  return `${prefix}/${label}-${hash}.webp`;
}

async function prepareAssets(loaded: LoadedManifest) {
  const { manifest } = loaded;
  const prefix = manifest.kind === "project" ? `projects/${manifest.slug}` : `reviews/${manifest.kind}/${manifest.slug}`;

  return Promise.all(
    loaded.assets.map(async (asset, index): Promise<PreparedAsset> => {
      const isCover = manifest.kind !== "project";
      const width = isCover ? 900 : index === 0 ? 1280 : 1600;
      const label = isCover ? "cover" : index === 0 ? "thumbnail" : `screenshot-${index}`;
      const buffer = await optimizeImage(asset.sourcePath, width);

      return {
        buffer,
        storagePath: hashedStoragePath(prefix, label, buffer),
      };
    }),
  );
}

function makePayload(manifest: ContentManifest, assets: PreparedAsset[]) {
  if (manifest.kind === "project") {
    return {
      slug: manifest.slug,
      title: manifest.title,
      summary: manifest.summary,
      description: manifest.description,
      thumbnailPath: assets[0].storagePath,
      thumbnailAlt: manifest.thumbnail.alt,
      screenshots: manifest.screenshots.map((screenshot, index) => ({
        storagePath: assets[index + 1].storagePath,
        alt: screenshot.alt,
        caption: screenshot.caption ?? null,
      })),
      githubUrl: manifest.githubUrl,
      liveUrl: manifest.liveUrl,
      publishedAt: toPublishedTimestamp(manifest.publishedAt),
    };
  }

  return {
    kind: manifest.kind,
    slug: manifest.slug,
    title: manifest.title,
    creator: manifest.creator,
    consumedOn: manifest.consumedOn,
    rating: manifest.rating,
    summary: manifest.summary,
    body: manifest.body,
    coverPath: assets[0].storagePath,
    coverAlt: manifest.cover.alt,
    publishedAt: toPublishedTimestamp(manifest.publishedAt),
  };
}

function isDuplicateObject(message: string) {
  return /duplicate|already exists/i.test(message);
}

async function main() {
  const arguments_ = process.argv.slice(2);

  if (!arguments_.includes("--approved")) {
    throw new Error("게시 전 검토가 필요합니다. 승인 후 --approved 플래그를 추가하세요.");
  }

  const loaded = await loadManifest(resolveManifestArgument(arguments_));
  const preparedAssets = await prepareAssets(loaded);
  const supabaseUrl = requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = requiredEnvironment("SUPABASE_SECRET_KEY");
  const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim() || "media";
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const newlyUploaded: string[] = [];

  try {
    for (const asset of preparedAssets) {
      const { error } = await supabase.storage.from(bucket).upload(asset.storagePath, asset.buffer, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });

      if (error && !isDuplicateObject(error.message)) {
        throw error;
      }

      if (!error) {
        newlyUploaded.push(asset.storagePath);
      }
    }

    const functionName = loaded.manifest.kind === "project" ? "publish_project" : "publish_review";
    const { data, error } = await supabase.rpc(functionName, {
      p_payload: makePayload(loaded.manifest, preparedAssets),
    });

    if (error) {
      throw error;
    }

    console.log(`게시 완료: ${loaded.manifest.kind}/${loaded.manifest.slug} (${String(data)})`);
  } catch (error) {
    if (newlyUploaded.length > 0) {
      const { error: cleanupError } = await supabase.storage.from(bucket).remove(newlyUploaded);

      if (cleanupError) {
        console.error(`업로드 롤백 실패: ${cleanupError.message}`);
      }
    }

    throw error;
  }
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
