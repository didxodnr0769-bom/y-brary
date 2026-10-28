import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import type { Project } from "@/lib/content/schema";

export function ProjectCard({ eager = false, project }: { eager?: boolean; project: Project }) {
  const href = `/projects/${project.slug}`;

  return (
    <article className="content-card project-card">
      <Link className="card-link" to={href}>
        <div className="card-media">
          <ContentImage
            src={project.thumbnail?.url}
            alt={project.thumbnail?.alt ?? ""}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="card-body">
          <div className="card-meta-row"><span className="kind-badge">{project.isSample ? "Sample 프로젝트" : "프로젝트"}</span></div>
          <h2 className="card-title">{project.title}</h2>
          <p className="card-summary">{project.summary}</p>
          <div className="card-footer">
            <span className="card-tags">{project.tags.slice(0, 2).map((tag) => <span className="topic-badge" key={tag}>{tag}</span>)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
