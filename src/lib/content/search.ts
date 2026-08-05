export function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

export function readSearchQuery(searchParams: { q?: string | string[] }) {
  const query = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  return (query ?? "").trim().slice(0, 80);
}
