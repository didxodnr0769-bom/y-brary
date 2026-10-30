import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import type { LatestContent } from "@/lib/content/repository";

export function LatestContentCard({ entry, order = 1, eager = false }: { entry: LatestContent; order?: number; eager?: boolean }) {
  const hasMedia = entry.kind !== "note";

  return (
    <article className={`journal-entry journal-entry-${entry.kind}${hasMedia ? "" : " journal-entry-text"}`}>
      <Link className="journal-entry-link" to={entry.href}>
        <div className="journal-entry-copy">
          <span className="record-number" aria-hidden="true">{String(order).padStart(2, "0")}</span>
          <div className="journal-entry-body">
            {entry.isSample ? <span className="journal-sample">Sample</span> : null}
            <h3 className="journal-entry-title">{entry.title}</h3>
            <p className="journal-entry-summary">{entry.summary}</p>
          </div>
        </div>
        {hasMedia ? (
          <div className="journal-entry-image">
            <ContentImage src={entry.image?.url} sources={entry.image?.sources} alt={entry.image?.alt ?? ""} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) 28vw, 220px" />
          </div>
        ) : null}
      </Link>
    </article>
  );
}
