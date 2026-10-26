
import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";
import { SearchForm } from "@/components/search-form";
import { listProjects } from "@/lib/content/repository";

export function ProjectsPage({ query }: { query: string }) {
  const projects = listProjects(query);

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow="Projects"
        title="만든 것들을 한곳에"
        description="완성한 결과를 중심으로 정리합니다. 자세한 개발 기록보다 무엇을 만들었는지 빠르게 살펴볼 수 있습니다."
        count={projects.length}
      />

      <SearchForm action="/projects" query={query} label="프로젝트 제목 또는 태그 검색" />

      {projects.length > 0 ? (
        <section className="project-grid" aria-label="프로젝트 목록">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} eager={index === 0} />
          ))}
        </section>
      ) : (
        <EmptyState query={query} label="프로젝트" />
      )}
    </div>
  );
}
