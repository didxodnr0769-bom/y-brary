import { projects, reviews } from "@/lib/content/static-data";
import { learningNotes } from "@/lib/content/notes";
import type { ReviewKind } from "@/lib/content/schema";
import { normalizeSearchText } from "@/lib/content/search";

export function listProjects(query = "") {
  const normalizedQuery = normalizeSearchText(query);

  return projects
    .filter((project) =>
      normalizeSearchText([project.title, ...project.tags].join(" ")).includes(normalizedQuery),
    )
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug) ?? null;
}

export function listReviews(kind: ReviewKind, query = "", filters: { category?: string; author?: string } = {}) {
  const normalizedQuery = normalizeSearchText(query);

  return reviews
    .filter((review) => review.kind === kind && normalizeSearchText(review.title).includes(normalizedQuery))
    .filter((review) => review.kind !== "book" || (
      (!filters.category || review.category === filters.category)
      && (!filters.author || review.creator === filters.author)
    ))
    .toSorted((a, b) => b.consumedOn.localeCompare(a.consumedOn));
}

export function getReviewBySlug(kind: ReviewKind, slug: string) {
  return reviews.find((review) => review.kind === kind && review.slug === slug) ?? null;
}

export function listLearningNotes(query = "") {
  const normalizedQuery = normalizeSearchText(query);
  return learningNotes
    .filter((note) => normalizeSearchText([note.title, ...note.tags].join(" ")).includes(normalizedQuery))
    .toSorted((a, b) => b.studiedOn.localeCompare(a.studiedOn));
}

export function getLearningNoteBySlug(slug: string) {
  return learningNotes.find((note) => note.slug === slug) ?? null;
}
