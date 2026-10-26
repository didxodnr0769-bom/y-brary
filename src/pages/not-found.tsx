import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <div>
        <h1>기록을 찾을 수 없습니다.</h1>
        <p>주소를 확인하거나 프로젝트 목록에서 다시 찾아보세요.</p>
        <Link className="back-link" to="/projects">← 프로젝트 목록</Link>
      </div>
    </section>
  );
}
