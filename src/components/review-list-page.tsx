import { Link, useSearchParams } from "react-router-dom";

import { BookSearchForm } from "@/components/book-search-form";
import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { ReviewCard } from "@/components/review-card";
import { SearchForm } from "@/components/search-form";
import { listReviews } from "@/lib/content/repository";
import { readSearchQuery } from "@/lib/content/search";
import { listContentTags } from "@/lib/content/tags";
import type { ReviewKind } from "@/lib/content/schema";

const copy = {
  book: {
    eyebrow: "Books",
    title: "읽고 남긴 문장들",
    description: "읽은 책의 감상을 최신순으로 모으고, 제목이나 저자, 카테고리로 찾아봅니다.",
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
  const [params] = useSearchParams();
  const category = kind === "book" ? params.get("category") ?? "" : "";
  const effectiveQuery = kind === "book" ? query || readSearchQuery({ q: params.get("author") ?? "" }) : query;
  const reviews = listReviews(kind, effectiveQuery, { category });
  const allBooks = kind === "book" ? listReviews("book") : [];
  const categoryTags = kind === "book" ? listContentTags("book").slice(0, 20) : [];
  const categories = [...new Set(allBooks.flatMap((book) => book.kind === "book" && book.category ? [book.category] : []))].sort((a, b) => a.localeCompare(b, "ko"));
  const pageCopy = copy[kind];

  function bookFilterHref(selectedCategory: string) {
    const next = new URLSearchParams();
    if (effectiveQuery) next.set("q", effectiveQuery);
    if (selectedCategory) next.set("category", selectedCategory);
    return next.size ? `/books?${next}` : "/books";
  }

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow={pageCopy.eyebrow}
        title={pageCopy.title}
        description={pageCopy.description}
        count={reviews.length}
      />
      {kind === "book" ? (
        <div className="collection-toolbar collection-toolbar-stacked">
          <BookSearchForm query={effectiveQuery} category={category} categories={categories} />
          <nav className="filter-chips" aria-label="책 카테고리 태그">
            <Link className="filter-chip" to={bookFilterHref("")} aria-current={!category ? "true" : undefined}>
              전체 <span className="filter-chip-count">{allBooks.length}</span>
            </Link>
            {categoryTags.map(({ tag, count }) => (
              <Link key={tag} className="filter-chip" to={bookFilterHref(tag)} aria-current={category === tag ? "true" : undefined}>
                {tag} <span className="filter-chip-count">{count}</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : (
        <SearchForm action={pageCopy.action} query={query} label={`${pageCopy.label} 제목 검색`} />
      )}
      {reviews.length > 0 ? (
        <section className={kind === "book" ? "review-grid book-grid" : "review-grid"} aria-label={kind === "book" ? "책 리뷰 목록" : "강의 기록 목록"}>
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} eager={index === 0} />
          ))}
        </section>
      ) : category ? (
        <section className="empty-state" aria-live="polite">
          <div>
            <strong>조건에 맞는 책 리뷰가 없습니다.</strong>
            <p>검색어나 카테고리 조건을 바꿔보세요.</p>
          </div>
        </section>
      ) : (
        <EmptyState query={effectiveQuery} label={kind === "book" ? "책 리뷰" : "강의 기록"} particle={kind === "book" ? "가" : "이"} />
      )}
    </div>
  );
}
