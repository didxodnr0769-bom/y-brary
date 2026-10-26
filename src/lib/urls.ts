export function assetUrl(source: string, base = import.meta.env.BASE_URL) {
  if (!source.startsWith("/") || source.startsWith("//")) return source;
  return `${base.replace(/\/$/, "")}${source}`;
}
