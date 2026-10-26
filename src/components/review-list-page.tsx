import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { ReviewCard } from "@/components/review-card";
import { SearchForm } from "@/components/search-form";
import { listReviews } from "@/lib/content/repository";
import type { ReviewKind } from "@/lib/content/schema";

const copy = {
  book: {
    eyebrow: "Books",
    title: "읽고 남긴 문장들",
    description: "책을 읽은 날짜와 별점, 한 줄 감상, 자세한 기록을 최신순으로 모읍니다.",
    label: "책",
    action: "/books" as const,
  },
  course: {
    eyebrow: "Courses",
    title: "배우고 남긴 강의 기록",
    description: "수강한 강의의 날짜와 별점, 한 줄 후기, 자세한 기록을 최신순으로 모읍니다.",
    label: "강의",
    action: "/courses" as const,
  },
};

export function ReviewListPage({ kind, query }: { kind: ReviewKind; query: string }) {
  const reviews = listReviews(kind, query);
  const pageCopy = copy[kind];

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow={pageCopy.eyebrow}
        title={pageCopy.title}
        description={pageCopy.description}
        count={reviews.length}
      />
      <SearchForm action={pageCopy.action} query={query} label={`${pageCopy.label} 제목 검색`} />
      {reviews.length > 0 ? (
        <section className="review-grid" aria-label={kind === "book" ? "책 리뷰 목록" : "강의 기록 목록"}>
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} eager={index === 0} />
          ))}
        </section>
      ) : (
        <EmptyState query={query} label={kind === "book" ? "책 리뷰" : "강의 기록"} particle={kind === "book" ? "가" : "이"} />
      )}
    </div>
  );
}
