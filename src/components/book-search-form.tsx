import { Link, useNavigate } from "react-router-dom";

import { SearchIcon } from "@/components/ui-icons";

type BookSearchFormProps = {
  query: string;
  category: string;
  categories: string[];
};

export function BookSearchForm({ query, category, categories }: BookSearchFormProps) {
  const navigate = useNavigate();

  return (
    <form id="archive-search" key={JSON.stringify([query, category])} className="search-form book-search-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const params = new URLSearchParams();
      for (const name of ["q", "category"]) {
        const value = String(form.get(name) ?? "").trim();
        if (value) params.set(name, name === "q" ? value.slice(0, 80) : value);
      }
      navigate({ pathname: "/books", search: params.toString() });
    }}>
      <label className="search-field book-title-field">
        <SearchIcon className="search-icon" />
        <span className="sr-only">책 제목 또는 저자 검색</span>
        <input key={query} className="search-input" type="search" name="q" defaultValue={query} maxLength={80} placeholder="책 제목 또는 저자 검색" />
      </label>
      <label className="book-filter-field">
        <span>카테고리</span>
        <select key={category} name="category" defaultValue={category}>
          <option value="">전체 카테고리</option>
          {category && !categories.includes(category) ? <option value={category}>{category}</option> : null}
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button className="search-submit" type="submit">검색</button>
      {query || category ? <Link className="search-reset" to="/books">초기화</Link> : null}
    </form>
  );
}
