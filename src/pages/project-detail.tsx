import { Link } from "react-router-dom";
import { NotFoundPage } from "@/pages/not-found";

import { ProjectGallery, type ProjectGalleryImage } from "@/components/project-gallery";
import { MarkdownContent } from "@/components/markdown-content";
import { formatDateRange } from "@/lib/content/format";
import { getProjectBySlug } from "@/lib/content/repository";

export function ProjectDetailPage({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug);
  if (!project) return <NotFoundPage />;
  const galleryImages: ProjectGalleryImage[] = [
    ...(project.thumbnail
      ? [
          {
            id: `${project.id}-thumbnail`,
            url: project.thumbnail.url,
            alt: project.thumbnail.alt,
            caption: "대표 이미지",
          },
        ]
      : []),
    ...project.screenshots.toSorted((a, b) => a.sortOrder - b.sortOrder).map((screenshot) => ({
      id: screenshot.id,
      url: screenshot.url,
      alt: screenshot.alt,
      caption: screenshot.caption,
    })),
  ];

  return (
    <article className="detail-page project-detail">
      <div className="detail-masthead">
        <Link className="back-link" to="/projects">
          <span aria-hidden="true">←</span> 프로젝트 목록
        </Link>

        <header className="detail-header">
          <div className="detail-kicker">
            <span className="kind-badge">Project</span>
            {project.tags.map((tag) => (
              <span className="topic-badge" key={tag}>
                {tag}
              </span>
            ))}
            {project.isSample ? <span className="sample-badge">Sample</span> : null}
          </div>
          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-summary">{project.summary}</p>
          {project.period || project.githubUrl || project.liveUrl ? (
            <div className="detail-header-footer">
              {project.period ? (
                <div className="detail-meta">
                  <span>
                    진행 기간{" "}
                    <strong>{formatDateRange(project.period.startedAt, project.period.endedAt)}</strong>
                  </span>
                </div>
              ) : null}
              {project.githubUrl || project.liveUrl ? (
                <div className="detail-actions">
                  {project.githubUrl ? (
                    <a className="external-link" href={project.githubUrl} target="_blank" rel="noreferrer">
                      GitHub ↗
                    </a>
                  ) : null}
                  {project.liveUrl ? (
                    <a className="external-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                      사이트 ↗
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </header>
      </div>

      <ProjectGallery images={galleryImages} />

      <MarkdownContent>{project.description}</MarkdownContent>
    </article>
  );
}
