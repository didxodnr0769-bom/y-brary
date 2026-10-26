import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import { formatDate } from "@/lib/content/format";
import type { LatestContent } from "@/lib/content/repository";

const labels = { project: "프로젝트", book: "책", course: "강의", note: "학습 정리" };

export function LatestContentCard({ entry, eager = false }: { entry: LatestContent; eager?: boolean }) {
  return (
    <article className={`content-card latest-card latest-card-${entry.kind}`}>
      <Link className="card-link" to={entry.href}>
        <div className="card-media">
          <ContentImage src={entry.image?.url} alt={entry.image?.alt ?? ""} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw" fallbackText={entry.kind === "note" ? "텍스트로 남긴 학습 정리" : undefined} />
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            <span className="kind-badge">{entry.isSample ? `Sample ${labels[entry.kind]}` : labels[entry.kind]}</span>
            <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt)}</time>
          </div>
          <h2 className="card-title">{entry.title}</h2>
          <p className="card-summary">{entry.summary}</p>
        </div>
      </Link>
    </article>
  );
}
