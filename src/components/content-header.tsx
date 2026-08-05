type ContentHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
};

export function ContentHeader({ eyebrow, title, description, count }: ContentHeaderProps) {
  return (
    <header className="content-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="content-description">{description}</p>
      </div>
      <div className="content-count" aria-label={`현재 ${count}개`}>
        <strong>{String(count).padStart(2, "0")}</strong>
        entries
      </div>
    </header>
  );
}
