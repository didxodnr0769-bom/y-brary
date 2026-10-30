import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import { openBookTransition } from "@/lib/book-transition";
import { formatDate } from "@/lib/content/format";
import type { Review } from "@/lib/content/schema";

const kindLabel = {
  book: "Book",
  course: "Course",
} as const;

export function ReviewCard({ eager = false, review }: { eager?: boolean; review: Review }) {
  const collection = review.kind === "book" ? "books" : "courses";
  const href = `/${collection}/${review.slug}`;
  const navigate = useNavigate();

  return (
    <article className="content-card review-card">
      <Link className="card-link" to={href} onClick={(event) => {
        if (review.kind !== "book" || !review.cover || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !Element.prototype.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const cover = event.currentTarget.querySelector<HTMLImageElement>(".card-media img");
        if (!cover || !cover.complete || !cover.naturalWidth || document.querySelector(".book-transition")) return;
        event.preventDefault();
        void openBookTransition(cover, () => flushSync(() => navigate(href)));
      }}>
        <div className="card-media">
          <ContentImage
            src={review.cover?.url}
            alt={review.cover?.alt ?? "강의 이미지 미첨부"}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
          />
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            {review.isSample ? <span className="sample-badge">Sample {kindLabel[review.kind]}</span> : review.kind === "course" ? <span className="kind-badge">Course</span> : null}
            {review.kind === "book" && review.category ? <span className="topic-badge">{review.category}</span> : null}
            <time dateTime={review.consumedOn}>{formatDate(review.consumedOn)}</time>
          </div>
          <h2 className="card-title">{review.title}</h2>
          <div className="review-meta">
            <span className={review.kind === "book" ? "book-author" : undefined}>{review.creator}</span>
            <span className="rating" aria-label={`5점 만점에 ${review.rating}점`}>
              {review.kind === "book" ? <span className="rating-stars" aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span> : `${review.rating} / 5`}
            </span>
          </div>
          <p className="card-summary">{review.summary}</p>
          {review.kind === "course" ? <div className="card-footer">
            <span className="card-read-label">수강 기록</span>
            <span className="card-open" aria-hidden="true">→</span>
          </div> : null}
        </div>
      </Link>
    </article>
  );
}
