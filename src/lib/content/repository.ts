import { cache } from "react";

import { sampleProjects, sampleReviews } from "@/lib/content/mock-data";
import { projectSchema, reviewSchema, type ReviewKind } from "@/lib/content/schema";
import { normalizeSearchText } from "@/lib/content/search";
import { getMediaPublicUrl, getPublicSupabaseClient } from "@/lib/supabase/public-client";

interface ProjectImageRow {
  alt_text: string;
  caption: string | null;
  id: string;
  sort_order: number;
  storage_path: string;
}

interface ProjectRow {
  description: string;
  github_url: string | null;
  id: string;
  live_url: string | null;
  project_images: ProjectImageRow[];
  published_at: string;
  slug: string;
  summary: string;
  thumbnail_alt: string;
  thumbnail_path: string;
  title: string;
}

interface ReviewRow {
  body: string;
  consumed_on: string;
  cover_alt: string;
  cover_path: string;
  creator: string;
  id: string;
  kind: ReviewKind;
  published_at: string;
  rating: number;
  slug: string;
  summary: string;
  title: string;
}

const projectSelect = `
  id,
  slug,
  title,
  summary,
  description,
  thumbnail_path,
  thumbnail_alt,
  github_url,
  live_url,
  published_at,
  project_images (
    id,
    storage_path,
    alt_text,
    caption,
    sort_order
  )
`;

const reviewSelect = `
  id,
  kind,
  slug,
  title,
  creator,
  consumed_on,
  rating,
  summary,
  body,
  cover_path,
  cover_alt,
  published_at
`;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function mapProject(row: ProjectRow) {
  return projectSchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    thumbnail: {
      url: getMediaPublicUrl(row.thumbnail_path),
      alt: row.thumbnail_alt,
    },
    screenshots: row.project_images
      .toSorted((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: getMediaPublicUrl(image.storage_path),
        alt: image.alt_text,
        caption: image.caption ?? undefined,
        sortOrder: image.sort_order,
      })),
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    publishedAt: row.published_at.slice(0, 10),
    isSample: false,
  });
}

function mapReview(row: ReviewRow) {
  return reviewSchema.parse({
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    title: row.title,
    creator: row.creator,
    consumedOn: row.consumed_on,
    rating: Number(row.rating),
    summary: row.summary,
    body: row.body,
    cover: {
      url: getMediaPublicUrl(row.cover_path),
      alt: row.cover_alt,
    },
    publishedAt: row.published_at.slice(0, 10),
    isSample: false,
  });
}

export async function listProjects(query = "") {
  const normalizedQuery = normalizeSearchText(query);

  const client = getPublicSupabaseClient();

  if (client) {
    let request = client
      .from("projects")
      .select(projectSelect)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    if (normalizedQuery) {
      request = request.ilike("title", `%${escapeLikePattern(normalizedQuery)}%`);
    }

    const { data, error } = await request;

    if (error) {
      throw new Error(`프로젝트를 불러오지 못했습니다: ${error.message}`);
    }

    return (data as ProjectRow[]).map(mapProject);
  }

  return sampleProjects
    .filter((project) => normalizeSearchText(project.title).includes(normalizedQuery))
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getProjectBySlug = cache(async (slug: string) => {
  const client = getPublicSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("projects")
      .select(projectSelect)
      .eq("slug", slug)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(`프로젝트를 불러오지 못했습니다: ${error.message}`);
    }

    return data ? mapProject(data as ProjectRow) : null;
  }

  return sampleProjects.find((project) => project.slug === slug) ?? null;
});

export async function listReviews(kind: ReviewKind, query = "") {
  const normalizedQuery = normalizeSearchText(query);

  const client = getPublicSupabaseClient();

  if (client) {
    let request = client
      .from("reviews")
      .select(reviewSelect)
      .eq("kind", kind)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    if (normalizedQuery) {
      request = request.ilike("title", `%${escapeLikePattern(normalizedQuery)}%`);
    }

    const { data, error } = await request;

    if (error) {
      throw new Error(`리뷰를 불러오지 못했습니다: ${error.message}`);
    }

    return (data as ReviewRow[]).map(mapReview);
  }

  return sampleReviews
    .filter((review) => review.kind === kind && normalizeSearchText(review.title).includes(normalizedQuery))
    .toSorted((a, b) => b.consumedOn.localeCompare(a.consumedOn));
}

export const getReviewBySlug = cache(async (kind: ReviewKind, slug: string) => {
  const client = getPublicSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from("reviews")
      .select(reviewSelect)
      .eq("kind", kind)
      .eq("slug", slug)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(`리뷰를 불러오지 못했습니다: ${error.message}`);
    }

    return data ? mapReview(data as ReviewRow) : null;
  }

  return sampleReviews.find((review) => review.kind === kind && review.slug === slug) ?? null;
});
