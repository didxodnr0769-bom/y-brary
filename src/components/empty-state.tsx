export function EmptyState({ query, label, particle = "가" }: { query: string; label: string; particle?: "이" | "가" }) {
  const hasQuery = query.length > 0;

  return (
    <section className="empty-state" aria-live="polite">
      <div>
        <strong>{hasQuery ? `일치하는 ${label}${particle} 없습니다.` : `아직 등록된 ${label}${particle} 없습니다.`}</strong>
        <p>
          {hasQuery
            ? `“${query}” 대신 다른 제목 키워드로 검색해보세요.`
            : "새 기록이 추가되면 이곳에서 확인할 수 있습니다."}
        </p>
      </div>
    </section>
  );
}
