import { learningNotes } from "@/lib/content/notes";
import type { LearningNote, Project, Review } from "@/lib/content/schema";
import { projects, reviews } from "@/lib/content/static-data";

export type ContentKind = "project" | "book" | "course" | "note";

export function contentTags(record: Project | Review | LearningNote): string[] {
  if ("tags" in record) return record.tags;
  if (record.kind === "book" && record.category) return [record.category];
  return [];
}

export function listContentTags(kind?: ContentKind): { tag: string; count: number }[] {
  const records = [
    ...projects.map((record) => ({ kind: "project" as const, record })),
    ...reviews.map((record) => ({ kind: record.kind, record })),
    ...learningNotes.map((record) => ({ kind: "note" as const, record })),
  ];
  const frequencies = new Map<string, number>();

  for (const { kind: recordKind, record } of records) {
    if (kind && recordKind !== kind) continue;
    for (const tag of new Set(contentTags(record))) {
      frequencies.set(tag, (frequencies.get(tag) ?? 0) + 1);
    }
  }

  return [...frequencies]
    .map(([tag, count]) => ({ tag, count }))
    .toSorted((first, second) => second.count - first.count || first.tag.localeCompare(second.tag, "ko"));
}
