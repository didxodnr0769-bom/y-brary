import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReviewDetail } from "@/components/review-detail";
import { getReviewBySlug } from "@/lib/content/repository";

type BookPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const review = await getReviewBySlug("book", (await params).slug);
  if (!review) return { title: "책 기록을 찾을 수 없음" };
  return { title: review.title, description: review.summary };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const review = await getReviewBySlug("book", (await params).slug);
  if (!review) notFound();
  return <ReviewDetail review={review} />;
}
