import { projects, reviews } from "@/lib/content/static-data";
import { learningNotes } from "@/lib/content/notes";
import type { ReviewKind } from "@/lib/content/schema";
import { normalizeSearchText } from "@/lib/content/search";

export type LatestContent = {
  id: string;
  kind: "project" | "book" | "course" | "note";
  title: string;
  summary: string;
  href: string;
  publishedAt: string;
  image: { url: string; alt: string } | null;
  isSample: boolean;
  searchText: string;
};

export function listLatestContent(query = ""): LatestContent[] {
  const normalizedQuery = normalizeSearchText(query);
  const entries: LatestContent[] = [
    ...projects.map((project) => ({
      id: `project:${project.id}`, kind: "project" as const,
      title: project.title, summary: project.summary, href: `/projects/${project.slug}`,
      publishedAt: project.publishedAt, image: project.thumbnail, isSample: project.isSample,
      searchText: [project.title, ...project.tags].join(" "),
    })),
    ...reviews.map((review) => ({
      id: `${review.kind}:${review.id}`, kind: review.kind,
      title: review.title, summary: review.summary,
      href: `/${review.kind === "book" ? "books" : "courses"}/${review.slug}`,
      publishedAt: review.publishedAt, image: review.cover, isSample: review.isSample,
      searchText: [review.title, review.creator, review.kind === "book" ? review.category : review.platform].filter(Boolean).join(" "),
    })),
    ...learningNotes.map((note) => ({
      id: `note:${note.id}`, kind: "note" as const,
      title: note.title, summary: note.summary, href: `/notes/${note.slug}`,
      publishedAt: note.publishedAt, image: null, isSample: note.isSample,
      searchText: [note.title, ...note.tags].join(" "),
    })),
  ];
  return entries
    .filter((entry) => normalizeSearchText(entry.searchText).includes(normalizedQuery))
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id, "en"));
}

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
