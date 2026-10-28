import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { CosmicGraph } from "@/components/cosmic-graph";
import { buildContentGraph } from "@/lib/content/graph";
import { listLatestContent } from "@/lib/content/repository";
import "@/styles/home.css";

export function HomePage({ query }: { query: string }) {
  const [params, setParams] = useSearchParams();
  const graph = useMemo(() => buildContentGraph(listLatestContent(query)), [query]);
  const tag = params.get("tag") ?? "";

  function selectTopic(topic: string | null) {
    if ((topic ?? "") === tag && !params.get("kind")) return;
    const next = new URLSearchParams(params);
    next.delete("kind");
    if (topic) next.set("tag", topic);
    else next.delete("tag");
    setParams(next, { preventScrollReset: true });
  }

  function selectCategory(kind: string | null) {
    const next = new URLSearchParams(params);
    next.delete("tag");
    if (kind) next.set("kind", kind);
    else next.delete("kind");
    setParams(next, { preventScrollReset: true });
  }

  return (
    <section className="cosmic-home" aria-label="기록 연결 지도">
      <h1 className="graph-sr-only">기록 연결 지도</h1>
      <CosmicGraph key={query} graph={graph} activeTag={tag} activeKind={params.get("kind") ?? ""} onSelectTopic={selectTopic} onSelectCategory={selectCategory} />
    </section>
  );
}
