type ContentHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  action?: { label: string; href: string };
};

export function ContentHeader({ eyebrow, title, description, count, action }: ContentHeaderProps) {
  return (
    <header className="content-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="content-description">{description}</p>
        {action ? <a className="hero-link" href={action.href}>{action.label}<span aria-hidden="true">→</span></a> : null}
      </div>
      <div className="content-count" aria-label={`현재 ${count}개`}>
        <strong>{String(count).padStart(2, "0")}</strong>
        entries
      </div>
    </header>
  );
}
