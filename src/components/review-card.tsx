import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import { formatDate } from "@/lib/content/format";
import type { Review } from "@/lib/content/schema";

const kindLabel = {
  book: "Book",
  course: "Course",
} as const;

export function ReviewCard({ eager = false, review }: { eager?: boolean; review: Review }) {
  const collection = review.kind === "book" ? "books" : "courses";
  const href = `/${collection}/${review.slug}`;

  return (
    <article className="content-card review-card">
      <Link className="card-link" to={href}>
        <div className="card-media">
          <ContentImage
            src={review.cover?.url}
            alt={review.cover?.alt ?? "강의 이미지 미첨부"}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 760px) 33vw, (max-width: 1200px) 25vw, 220px"
          />
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            <span className="kind-badge">{review.isSample ? `Sample ${kindLabel[review.kind]}` : kindLabel[review.kind]}</span>
            {review.kind === "book" && review.category ? <span className="topic-badge">{review.category}</span> : null}
            <time dateTime={review.consumedOn}>{formatDate(review.consumedOn)}</time>
          </div>
          <h2 className="card-title">{review.title}</h2>
          <div className="review-meta">
            <span>{review.creator}</span>
            <span className="rating" aria-label={`5점 만점에 ${review.rating}점`}>
              {review.rating} / 5
            </span>
          </div>
          <p className="card-summary">{review.summary}</p>
        </div>
      </Link>
    </article>
  );
}
