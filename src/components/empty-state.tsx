export function EmptyState({ query, label }: { query: string; label: string }) {
  return (
    <section className="empty-state" aria-live="polite">
      <div>
        <strong>일치하는 {label}가 없습니다.</strong>
        <p>“{query}” 대신 다른 제목 키워드로 검색해보세요.</p>
      </div>
    </section>
  );
}
