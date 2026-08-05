import type { Metadata } from "next";

import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";
import { SearchForm } from "@/components/search-form";
import { listProjects } from "@/lib/content/repository";
import { readSearchQuery } from "@/lib/content/search";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "양태욱의 사이드 프로젝트를 모아보는 아카이브입니다.",
};

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = readSearchQuery(await searchParams);
  const projects = await listProjects(query);

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow="Projects"
        title="만든 것들을 한곳에"
        description="완성한 결과를 중심으로 정리합니다. 자세한 개발 기록보다 무엇을 만들었는지 빠르게 살펴볼 수 있습니다."
        count={projects.length}
      />

      <SearchForm action="/" query={query} label="프로젝트 제목 검색" />

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
