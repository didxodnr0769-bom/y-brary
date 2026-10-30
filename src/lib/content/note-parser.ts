import { parse } from "yaml";

import { learningNoteSchema, type LearningNote } from "./schema";

export function parseLearningNote(source: string, fileName: string): LearningNote {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(source);
  if (!match) throw new Error(`${fileName}: YAML 메타데이터가 필요합니다.`);
  const metadata: unknown = parse(match[1], { uniqueKeys: true, maxAliasCount: 0 });
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${fileName}: 메타데이터는 객체여야 합니다.`);
  }
  const note = learningNoteSchema.parse({ ...metadata, body: match[2].trim() });
  const expectedSlug = fileName.split("/").at(-1)?.replace(/\.md$/, "");
  if (note.slug !== expectedSlug) throw new Error(`${fileName}: 파일명과 slug가 일치해야 합니다.`);
  return note;
}

export function parseLearningNotes(files: Record<string, string>) {
  const notes = Object.entries(files).map(([fileName, source]) => parseLearningNote(source, fileName));
  if (new Set(notes.map((note) => note.id)).size !== notes.length || new Set(notes.map((note) => note.slug)).size !== notes.length) {
    throw new Error("노트의 id와 slug는 고유해야 합니다.");
  }
  return notes;
}
