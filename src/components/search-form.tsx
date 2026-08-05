import Link from "next/link";

type SearchPath = "/" | "/books" | "/films";

type SearchFormProps = {
  action: SearchPath;
  query: string;
  label: string;
};

export function SearchForm({ action, query, label }: SearchFormProps) {
  return (
    <form className="search-form" action={action} role="search">
      <label className="search-field">
        <span className="sr-only">{label}</span>
        <input
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
        <Link className="search-reset" href={action}>
          초기화
        </Link>
      ) : null}
    </form>
  );
}
