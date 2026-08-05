import type { Metadata } from "next";

import { ReviewListPage } from "@/components/review-list-page";
import { readSearchQuery } from "@/lib/content/search";

export const metadata: Metadata = {
  title: "영화",
  description: "본 영화의 감상일, 별점, 한 줄 감상과 상세 리뷰를 모읍니다.",
};

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return <ReviewListPage kind="film" query={readSearchQuery(await searchParams)} />;
}
