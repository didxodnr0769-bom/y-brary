import { Link, useNavigate } from "react-router-dom";

type SearchPath = "/" | "/projects" | "/books" | "/courses" | "/notes";

type SearchFormProps = {
  action: SearchPath;
  query: string;
  label: string;
};

export function SearchForm({ action, query, label }: SearchFormProps) {
  const navigate = useNavigate();
  return (
    <form className="search-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      const value = String(new FormData(event.currentTarget).get("q") ?? "").trim().slice(0, 80);
      navigate({ pathname: action, search: value ? `?${new URLSearchParams({ q: value })}` : "" });
    }}>
      <label className="search-field">
        <span className="sr-only">{label}</span>
        <input
          key={`${action}:${query}`}
          className="search-input"
          type="search"
          name="q"
          defaultValue={query}
          maxLength={80}
          placeholder={label}
        />
      </label>
      <button className="search-submit" type="submit">
        검색
      </button>
      {query ? (
        <Link className="search-reset" to={action}>
          초기화
        </Link>
      ) : null}
    </form>
  );
}
