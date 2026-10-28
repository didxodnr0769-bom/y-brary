import { Link, useSearchParams } from "react-router-dom";

import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";
import { SearchForm } from "@/components/search-form";
import { listProjects } from "@/lib/content/repository";
import { listContentTags } from "@/lib/content/tags";

export function ProjectsPage({ query }: { query: string }) {
  const [params] = useSearchParams();
  const activeTag = params.get("tag") ?? "";
  const projects = listProjects(query, { tag: activeTag });
  const tags = listContentTags("project").slice(0, 20);

  function tagHref(tag: string) {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (tag) next.set("tag", tag);
    return `/projects${next.size ? `?${next}` : ""}`;
  }

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow="Projects"
        title="만든 것들을 한곳에"
        description="완성한 결과를 중심으로 정리합니다. 자세한 개발 기록보다 무엇을 만들었는지 빠르게 살펴볼 수 있습니다."
        count={projects.length}
      />
      <div className="collection-toolbar collection-toolbar-stacked">
        <SearchForm action="/projects" query={query} label="프로젝트 제목 또는 태그 검색" hiddenParams={{ tag: activeTag }} />
        <nav className="filter-chips" aria-label="프로젝트 태그">
          <Link className="filter-chip" to={tagHref("")} aria-current={!activeTag ? "true" : undefined}>
            전체 <span className="filter-chip-count">{listProjects().length}</span>
          </Link>
          {tags.map(({ tag, count }) => (
            <Link key={tag} className="filter-chip" to={tagHref(tag)} aria-current={activeTag === tag ? "true" : undefined}>
              {tag}<span className="filter-chip-count">{count}</span>
            </Link>
          ))}
        </nav>
      </div>
      {projects.length ? (
        <section className="project-grid" aria-label="프로젝트 목록">
          {projects.map((project, index) => <ProjectCard key={project.id} project={project} eager={index === 0} />)}
        </section>
      ) : <EmptyState query={query || activeTag} label="프로젝트" />}
    </div>
  );
}
