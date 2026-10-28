import { Link } from "react-router-dom";

import { ContentImage } from "@/components/content-image";
import type { LatestContent } from "@/lib/content/repository";

export function HomeBookshelf({ entries }: { entries: (LatestContent & { creator: string })[] }) {
  const books = entries.slice(0, 2);
  return (
    <section id="home-books" className="home-bookshelf" tabIndex={-1} aria-label="책 미리보기">
      <div className="home-section-heading">
        <h2 id="bookshelf-title">책</h2>
        <Link className="home-section-link" to="/books" aria-label="독서 기록 모두 보기">모두 보기 <span aria-hidden="true">→</span></Link>
      </div>
      {books.length ? (
        <div className="bookshelf-list">
          {books.map((book) => (
            <article key={book.id} className="bookshelf-book">
              <Link className="bookshelf-book-link" to={book.href}>
                <div className="bookshelf-cover">
                  <ContentImage src={book.image?.url} alt={book.image?.alt ?? "책 표지 미첨부"} fill loading="lazy" sizes="(max-width: 760px) 100px, 120px" />
                </div>
                <div className="bookshelf-copy">
                  {book.isSample ? <span className="bookshelf-sample">Sample</span> : null}
                  <h3>{book.title}</h3>
                  <p className="bookshelf-author">{book.creator}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : <p className="home-section-empty">아직 표시할 책 기록이 없습니다.</p>}
    </section>
  );
}
