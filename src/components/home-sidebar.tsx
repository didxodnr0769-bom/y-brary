import { Link } from "react-router-dom";

import { listContentTags } from "@/lib/content/tags";

export function HomeSidebar({ activeTag = "" }: { activeTag?: string }) {
  const tags = listContentTags().slice(0, 20);
  if (!tags.length) return null;

  return (
    <aside className="home-topics" aria-label="기록 주제">
      <div className="home-section-heading">
        <h2>자주 남기는 주제</h2>
      </div>
      <div className="sidebar-tags">
        {tags.map(({ tag, count }) => (
          <Link key={tag} to={`/?${new URLSearchParams({ tag })}`} aria-current={activeTag === tag ? "true" : undefined}>
            <span>{tag}</span><span className="tag-count">{count}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
