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
        eyebrow="Notes"
        title="배움과 생각을 기록하다"
        description="배운 것과 생각한 것, 대화하며 달라진 관점을 기록합니다."
        count={notes.length}
      />
      <SearchForm action="/notes" query={query} label="노트 제목·태그 검색" />
      {notes.length > 0 ? (
        <section className="learning-note-list" aria-label="노트 목록">
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
        <EmptyState query={query} label="노트" />
      )}
    </div>
  );
}
