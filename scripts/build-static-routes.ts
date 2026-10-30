import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { loadEnv } from "vite";

import { projects, reviews } from "../src/lib/content/static-data.ts";
import { parseLearningNotes } from "../src/lib/content/note-parser.ts";

const defaultDescription = "프로젝트와 책, 강의 기록, 노트를 모은 개인 아카이브 YBrary입니다.";

type RouteMetadata = { path: string; title: string; description: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function replaceRequired(html: string, pattern: RegExp, replacement: string, label: string) {
  if (!pattern.test(html)) throw new Error(`정적 경로 메타데이터를 만들 수 없습니다: ${label} 태그가 없습니다.`);
  return html.replace(pattern, () => replacement);
}

/** Replace the HTML shell metadata before it is sent to non-JavaScript link scrapers. */
export function renderRouteMetadata(html: string, route: RouteMetadata, siteUrl: string, basePath: string) {
  const title = `${route.title} | YBrary`;
  const normalizedBase = basePath.replace(/^\/+|\/+$/g, "");
  const segments = [normalizedBase, route.path.replace(/^\/+|\/+$/g, "")].filter(Boolean).join("/");
  const path = segments ? `/${segments}/` : "/";
  const url = new URL(path, siteUrl).href;
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(route.description);
  const escapedUrl = escapeHtml(url);
  const metadata = [
    { pattern: /<title\b[^>]*>[\s\S]*?<\/title>/i, value: `<title>${escapedTitle}</title>`, label: "title" },
    { pattern: /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i, value: `<meta name="description" content="${escapedDescription}" />`, label: "description" },
    { pattern: /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i, value: `<meta property="og:title" content="${escapedTitle}" />`, label: "og:title" },
    { pattern: /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i, value: `<meta property="og:description" content="${escapedDescription}" />`, label: "og:description" },
    { pattern: /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i, value: `<meta property="og:url" content="${escapedUrl}" />`, label: "og:url" },
    { pattern: /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/i, value: `<meta name="twitter:title" content="${escapedTitle}" />`, label: "twitter:title" },
    { pattern: /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/i, value: `<meta name="twitter:description" content="${escapedDescription}" />`, label: "twitter:description" },
    { pattern: /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, value: `<link rel="canonical" href="${escapedUrl}" />`, label: "canonical" },
  ];
  return metadata.reduce((result, { pattern, value, label }) => replaceRequired(result, pattern, value, label), html);
}

async function buildStaticRoutes() {
  const notesDirectory = new URL("../content/notes/", import.meta.url);
  const noteFiles: Record<string, string> = {};
  for (const file of await readdir(notesDirectory)) {
    if (file.endsWith(".md")) noteFiles[file] = await readFile(new URL(file, notesDirectory), "utf8");
  }
  const notes = parseLearningNotes(noteFiles);
  const dist = new URL("../dist/", import.meta.url);
  const html = await readFile(new URL("index.html", dist), "utf8");
  const env = loadEnv("production", process.cwd(), "VITE_");
  const siteUrl = env.VITE_SITE_URL || "http://localhost:3001";
  const basePath = env.VITE_BASE_PATH || "/";
  const routes: RouteMetadata[] = [
    { path: "projects", title: "프로젝트", description: defaultDescription },
    { path: "books", title: "책", description: defaultDescription },
    { path: "courses", title: "강의 기록", description: defaultDescription },
    { path: "notes", title: "노트", description: defaultDescription },
    ...projects.map((project) => ({ path: `projects/${project.slug}`, title: project.title, description: project.summary })),
    ...reviews.map((review) => ({ path: `${review.kind === "book" ? "books" : "courses"}/${review.slug}`, title: review.title, description: review.summary })),
    ...notes.map((note) => ({ path: `notes/${note.slug}`, title: note.title, description: note.summary })),
  ];
  for (const route of routes) {
    const target = new URL(`${route.path}/`, dist);
    await mkdir(target, { recursive: true });
    await writeFile(new URL("index.html", target), renderRouteMetadata(html, route, siteUrl, basePath));
  }
  await writeFile(new URL("404.html", dist), html);
  await writeFile(new URL(".nojekyll", dist), "");
  console.log(`정적 페이지 준비: 홈, ${routes.length}개 목록·상세 경로, 404`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildStaticRoutes().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
