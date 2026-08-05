import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/content/format";
import type { Review } from "@/lib/content/schema";

const kindCopy = {
  book: { label: "책", collection: "/books" as Route, creator: "저자", type: "Book" },
  film: { label: "영화", collection: "/films" as Route, creator: "감독", type: "Film" },
};

export function ReviewDetail({ review }: { review: Review }) {
  const copy = kindCopy[review.kind];

  return (
    <article className="detail-page">
      <Link className="back-link" href={copy.collection}>
        <span aria-hidden="true">←</span> {copy.label} 목록
      </Link>

      <div className="review-detail-layout">
        <div className="review-cover">
          <div className="detail-hero">
            <Image src={review.cover.url} alt={review.cover.alt} fill sizes="(max-width: 640px) 90vw, 340px" />
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
                <dd>{review.creator}</dd>
              </div>
              <div>
                <dt>감상일</dt>
                <dd>{formatDate(review.consumedOn)}</dd>
              </div>
              <div>
                <dt>별점</dt>
                <dd className="rating" aria-label={`5점 만점에 ${review.rating}점`}>
                  {review.rating.toFixed(1)} / 5
                </dd>
              </div>
            </dl>
          </header>
        </div>
      </div>

      <section className="review-note-section" aria-labelledby="review-note-title">
        <div className="section-heading">
          <h2 id="review-note-title">리뷰</h2>
          <span>Review note</span>
        </div>
        <p className="review-body">{review.body}</p>
      </section>
    </article>
  );
}
