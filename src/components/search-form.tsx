import { Link, useNavigate } from "react-router-dom";

import { SearchIcon } from "@/components/ui-icons";

type SearchPath = "/" | "/projects" | "/books" | "/courses" | "/notes";

type SearchFormProps = {
  action: SearchPath;
  query: string;
  label: string;
  hiddenParams?: Record<string, string>;
};

export function SearchForm({ action, query, label, hiddenParams = {} }: SearchFormProps) {
  const navigate = useNavigate();
  return (
    <form id="archive-search" className="search-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      const value = String(new FormData(event.currentTarget).get("q") ?? "").trim().slice(0, 80);
      const params = new URLSearchParams(Object.entries(hiddenParams).filter(([, value]) => value));
      if (value) params.set("q", value);
      navigate({ pathname: action, search: params.toString() });
    }}>
      <label className="search-field">
        <SearchIcon className="search-icon" />
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
      {query || Object.values(hiddenParams).some(Boolean) ? (
        <Link className="search-reset" to={action}>
          초기화
        </Link>
      ) : null}
    </form>
  );
}
