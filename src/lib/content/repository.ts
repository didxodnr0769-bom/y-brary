import { cache } from "react";

import { projects, reviews } from "@/lib/content/static-data";
import type { ReviewKind } from "@/lib/content/schema";
import { normalizeSearchText } from "@/lib/content/search";

export async function listProjects(query = "") {
  const normalizedQuery = normalizeSearchText(query);

  return projects
    .filter((project) =>
      normalizeSearchText([project.title, ...project.tags].join(" ")).includes(normalizedQuery),
    )
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getProjectBySlug = cache(async (slug: string) => {
  return projects.find((project) => project.slug === slug) ?? null;
});

export async function listReviews(kind: ReviewKind, query = "") {
  const normalizedQuery = normalizeSearchText(query);

  return reviews
    .filter((review) => review.kind === kind && normalizeSearchText(review.title).includes(normalizedQuery))
    .toSorted((a, b) => b.consumedOn.localeCompare(a.consumedOn));
}

export const getReviewBySlug = cache(async (kind: ReviewKind, slug: string) => {
  return reviews.find((review) => review.kind === kind && review.slug === slug) ?? null;
});
