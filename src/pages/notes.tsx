import { Link } from "react-router-dom";

import { ContentHeader } from "@/components/content-header";
import { EmptyState } from "@/components/empty-state";
import { SearchForm } from "@/components/search-form";
import { formatDate } from "@/lib/content/format";
import { listLearningNotes } from "@/lib/content/repository";

export function LearningNotesPage({ query }: { query: string }) {
  const notes = listLearningNotes(query);

  return (
    <div className="page-stack">
      <ContentHeader
        eyebrow="Learning Notes"
        title="배운 것을 내 것으로"
        description="새로 알게 된 개념과 직접 해본 실습, 다시 꺼내 볼 내용을 정리합니다."
        count={notes.length}
      />
      <SearchForm action="/notes" query={query} label="학습 정리 제목·태그 검색" />
      {notes.length > 0 ? (
        <section className="learning-note-list" aria-label="학습 정리 목록">
          {notes.map((note) => (
            <article className="learning-note-card" key={note.id}>
              <Link className="card-link" to={`/notes/${note.slug}`}>
                <div className="card-meta-row">
                  <span className="kind-badge">{note.isSample ? "Sample Note" : "Note"}</span>
                  <time dateTime={note.studiedOn}>{formatDate(note.studiedOn)}</time>
                </div>
                <h2 className="card-title">{note.title}</h2>
                <p className="card-summary">{note.summary}</p>
                {note.tags.length > 0 ? (
                  <ul className="learning-note-tags" aria-label="주제 태그">
                    {note.tags.map((tag) => <li key={tag}>#{tag}</li>)}
                  </ul>
                ) : null}
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState query={query} label="학습 정리" />
      )}
    </div>
  );
}
