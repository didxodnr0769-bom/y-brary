import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { LatestContentCard } from "@/components/latest-content-card";
import { SearchForm } from "@/components/search-form";
import { listLatestContent } from "@/lib/content/repository";
import "@/styles/home.css";

export function HomePage({ query }: { query: string }) {
  const entries = listLatestContent(query);
  return (
    <div className="page-stack">
      <ContentHeader eyebrow="Archive" title="새로 남긴 기록들" description="프로젝트와 책, 강의, 학습 정리를 게시일 최신순으로 모았습니다." count={entries.length} />
      <SearchForm action="/" query={query} label="제목, 태그, 저자 또는 카테고리 검색" />
      {entries.length ? (
        <section className="latest-grid" aria-label="최신 기록 목록">
          {entries.map((entry, index) => <LatestContentCard key={entry.id} entry={entry} eager={index === 0} />)}
        </section>
      ) : <EmptyState query={query} label="기록" particle="이" />}
    </div>
  );
}
