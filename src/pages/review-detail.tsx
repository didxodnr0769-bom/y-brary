import { ReviewDetail } from "@/components/review-detail";
import { getReviewBySlug } from "@/lib/content/repository";
import type { ReviewKind } from "@/lib/content/schema";
import { NotFoundPage } from "@/pages/not-found";

export function ReviewDetailPage({ kind, slug }: { kind: ReviewKind; slug: string }) {
  const review = getReviewBySlug(kind, slug);
  return review ? <ReviewDetail review={review} /> : <NotFoundPage />;
}
