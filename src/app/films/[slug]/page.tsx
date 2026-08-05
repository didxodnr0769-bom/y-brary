import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReviewDetail } from "@/components/review-detail";
import { getReviewBySlug } from "@/lib/content/repository";

type FilmPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const review = await getReviewBySlug("film", (await params).slug);
  if (!review) return { title: "영화 기록을 찾을 수 없음" };
  return { title: review.title, description: review.summary };
}

export default async function FilmDetailPage({ params }: FilmPageProps) {
  const review = await getReviewBySlug("film", (await params).slug);
  if (!review) notFound();
  return <ReviewDetail review={review} />;
}
