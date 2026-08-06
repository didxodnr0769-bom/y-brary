import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectGallery, type ProjectGalleryImage } from "@/components/project-gallery";
import { formatDateRange } from "@/lib/content/format";
import { getProjectBySlug } from "@/lib/content/repository";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return { title: "프로젝트를 찾을 수 없음" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();
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
    <article className="detail-page">
      <Link className="back-link" href="/">
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

      <ProjectGallery images={galleryImages} />

      <div className="detail-copy">
        <div className="detail-description">
          {project.description.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
