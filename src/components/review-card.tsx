import type { Route } from "next";
import Link from "next/link";

import { ContentImage } from "@/components/content-image";
import { formatDate } from "@/lib/content/format";
import type { Review } from "@/lib/content/schema";

const kindLabel = {
  book: "Book",
  film: "Film",
} as const;

export function ReviewCard({ eager = false, review }: { eager?: boolean; review: Review }) {
  const collection = review.kind === "book" ? "books" : "films";
  const href = `/${collection}/${review.slug}` as Route;

  return (
    <article className="content-card review-card">
      <Link className="card-link" href={href}>
        <div className="card-media">
          <ContentImage
            src={review.cover.url}
            alt={review.cover.alt}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 760px) 33vw, (max-width: 1200px) 25vw, 220px"
          />
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            <span className="kind-badge">{review.isSample ? `Sample ${kindLabel[review.kind]}` : kindLabel[review.kind]}</span>
            <time dateTime={review.consumedOn}>{formatDate(review.consumedOn)}</time>
          </div>
          <h2 className="card-title">{review.title}</h2>
          <div className="review-meta">
            <span>{review.creator}</span>
            <span className="rating" aria-label={`5점 만점에 ${review.rating}점`}>
              {review.rating.toFixed(1)} / 5
            </span>
          </div>
          <p className="card-summary">{review.summary}</p>
        </div>
      </Link>
    </article>
  );
}
