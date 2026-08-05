import type { Metadata } from "next";

import { ReviewListPage } from "@/components/review-list-page";
import { readSearchQuery } from "@/lib/content/search";

export const metadata: Metadata = {
  title: "책",
  description: "읽은 책의 감상일, 별점, 한 줄 감상과 상세 리뷰를 모읍니다.",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return <ReviewListPage kind="book" query={readSearchQuery(await searchParams)} />;
}
