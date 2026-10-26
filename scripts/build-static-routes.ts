import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

import { projects, reviews } from "../src/lib/content/static-data.ts";
import { parseLearningNotes } from "../src/lib/content/note-parser.ts";

async function buildStaticRoutes() {
  const notesDirectory = new URL("../content/notes/", import.meta.url);
  const noteFiles: Record<string, string> = {};
  for (const file of await readdir(notesDirectory)) {
    if (file.endsWith(".md")) noteFiles[file] = await readFile(new URL(file, notesDirectory), "utf8");
  }
  const notes = parseLearningNotes(noteFiles);
  const dist = new URL("../dist/", import.meta.url);
  const html = await readFile(new URL("index.html", dist), "utf8");
  const paths = [
    "projects", "books", "courses", "notes",
    ...projects.map((project) => `projects/${project.slug}`),
    ...reviews.map((review) => `${review.kind === "book" ? "books" : "courses"}/${review.slug}`),
    ...notes.map((note) => `notes/${note.slug}`),
  ];
  for (const path of paths) {
    const target = new URL(`${path}/`, dist);
    await mkdir(target, { recursive: true });
    await writeFile(new URL("index.html", target), html);
  }
  await writeFile(new URL("404.html", dist), html);
  await writeFile(new URL(".nojekyll", dist), "");
  console.log(`정적 페이지 준비: 홈, ${paths.length}개 목록·상세 경로, 404`);
}

buildStaticRoutes().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
