import { Link } from "react-router-dom";
import { MarkdownContent } from "@/components/markdown-content";

import { formatDate } from "@/lib/content/format";
import { getLearningNoteBySlug } from "@/lib/content/repository";
import { NotFoundPage } from "@/pages/not-found";

export function LearningNoteDetailPage({ slug }: { slug: string }) {
  const note = getLearningNoteBySlug(slug);
  if (!note) return <NotFoundPage />;

  return (
    <article className="detail-page learning-note-detail">
      <Link className="back-link" to="/notes">
        <span aria-hidden="true">←</span> 학습 정리 목록
      </Link>
      <header className="detail-header">
        <div className="detail-kicker">
          <span className="kind-badge">Learning note</span>
          {note.isSample ? <span className="sample-badge">Sample</span> : null}
        </div>
        <h1 className="detail-title">{note.title}</h1>
        <p className="detail-summary">{note.summary}</p>
        <div className="detail-meta">
          <span>정리일 <time dateTime={note.studiedOn}>{formatDate(note.studiedOn)}</time></span>
        </div>
        {note.tags.length > 0 ? (
          <ul className="learning-note-tags" aria-label="주제 태그">
            {note.tags.map((tag) => <li key={tag}>#{tag}</li>)}
          </ul>
        ) : null}
      </header>
      <section className="review-note-section" aria-labelledby="learning-note-title">
        <div className="section-heading">
          <h2 id="learning-note-title">학습 내용</h2>
          <span>Learning note</span>
        </div>
        <MarkdownContent>{note.body}</MarkdownContent>
      </section>
    </article>
  );
}
