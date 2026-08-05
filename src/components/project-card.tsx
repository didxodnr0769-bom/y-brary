import type { Route } from "next";
import Link from "next/link";

import { ContentImage } from "@/components/content-image";
import { formatDate } from "@/lib/content/format";
import type { Project } from "@/lib/content/schema";

export function ProjectCard({ eager = false, project }: { eager?: boolean; project: Project }) {
  const href = `/projects/${project.slug}` as Route;

  return (
    <article className="content-card project-card">
      <Link className="card-link" href={href}>
        <div className="card-media">
          <ContentImage
            src={project.thumbnail.url}
            alt={project.thumbnail.alt}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            {project.isSample ? <span className="sample-badge">Sample</span> : <span />}
            <time dateTime={project.publishedAt}>{formatDate(project.publishedAt)}</time>
          </div>
          <h2 className="card-title">{project.title}</h2>
          <p className="card-summary">{project.summary}</p>
        </div>
      </Link>
    </article>
  );
}
