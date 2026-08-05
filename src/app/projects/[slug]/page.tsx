import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/content/format";
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

  return (
    <article className="detail-page">
      <Link className="back-link" href="/">
        <span aria-hidden="true">←</span> 프로젝트 목록
      </Link>

      <header className="detail-header">
        <div className="detail-kicker">
          <span className="kind-badge">Project</span>
          {project.isSample ? <span className="sample-badge">Sample</span> : null}
        </div>
        <h1 className="detail-title">{project.title}</h1>
        <p className="detail-summary">{project.summary}</p>
        <div className="detail-meta">
          <span>
            게시일 <strong>{formatDate(project.publishedAt)}</strong>
          </span>
          <span>
            스크린샷 <strong>{project.screenshots.length}</strong>
          </span>
        </div>
      </header>

      <div className="detail-hero">
        <Image src={project.thumbnail.url} alt={project.thumbnail.alt} fill sizes="(max-width: 900px) 100vw, 1040px" />
      </div>

      <div className="detail-copy">
        <p>{project.description}</p>
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

      <section className="screenshots-section">
        <div className="section-heading">
          <h2>화면</h2>
          <span>{String(project.screenshots.length).padStart(2, "0")}</span>
        </div>
        <div className="screen-grid">
          {project.screenshots.toSorted((a, b) => a.sortOrder - b.sortOrder).map((screenshot) => (
            <figure key={screenshot.id}>
              <div className="screen-frame">
                <Image src={screenshot.url} alt={screenshot.alt} fill sizes="(max-width: 640px) 100vw, 520px" />
              </div>
              {screenshot.caption ? <figcaption className="screen-caption">{screenshot.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>
    </article>
  );
}
