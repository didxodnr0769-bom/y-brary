import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import { formatDate } from "@/lib/content/format";
import type { Review } from "@/lib/content/schema";

const kindCopy = {
  book: { label: "책", collection: "/books", creator: "저자", type: "Book", date: "감상일", note: "리뷰" },
  course: { label: "강의", collection: "/courses", creator: "강사", type: "Course", date: "수강일", note: "수강 후기" },
};

export function ReviewDetail({ review }: { review: Review }) {
  const copy = kindCopy[review.kind];

  return (
    <article className="detail-page">
      <Link className="back-link" to={copy.collection}>
        <span aria-hidden="true">←</span> {copy.label} 목록
      </Link>

      <div className="review-detail-layout">
        <div className="review-cover">
          <div className="detail-hero">
            <ContentImage src={review.cover?.url} alt={review.cover?.alt ?? "강의 이미지 미첨부"} fill sizes="(max-width: 640px) 90vw, 340px" />
          </div>
        </div>

        <div className="review-content">
          <header className="detail-header">
            <div className="detail-kicker">
              <span className="kind-badge">{review.kind}</span>
              {review.isSample ? <span className="sample-badge">Sample</span> : null}
            </div>
            <h1 className="detail-title">{review.title}</h1>
            <p className="detail-summary">{review.summary}</p>
            <dl className="review-facts">
              <div>
                <dt>유형</dt>
                <dd>{copy.type}</dd>
              </div>
              <div>
                <dt>{copy.creator}</dt>
                <dd>{review.kind === "book" ? (
                  <Link className="book-collection-link" to={`/books?${new URLSearchParams({ author: review.creator })}`}>{review.creator}</Link>
                ) : review.creator}</dd>
              </div>
              {review.kind === "book" && review.category ? (
                <div>
                  <dt>카테고리</dt>
                  <dd><Link className="book-collection-link" to={`/books?${new URLSearchParams({ category: review.category })}`}>{review.category}</Link></dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.date}</dt>
                <dd>{formatDate(review.consumedOn)}</dd>
              </div>
              <div>
                <dt>별점</dt>
                <dd className="rating" aria-label={`5점 만점에 ${review.rating}점`}>
                  {review.rating.toFixed(1)} / 5
                </dd>
              </div>
              {review.kind === "course" && review.platform ? (
                <div>
                  <dt>플랫폼</dt>
                  <dd>{review.platform}</dd>
                </div>
              ) : null}
            </dl>
          </header>
        </div>
      </div>

      <section className="review-note-section" aria-labelledby="review-note-title">
        <div className="section-heading">
          <h2 id="review-note-title">{copy.note}</h2>
          <span>Review note</span>
        </div>
        <p className="review-body">{review.body}</p>
      </section>
    </article>
  );
}
