import { describe, expect, it } from "vitest";

import { buildContentGraph } from "@/lib/content/graph";
import { listLatestContent, type LatestContent } from "@/lib/content/repository";

function entry(id: string, tags: string[]): LatestContent {
  return { id, kind: "note", title: id, summary: "테스트", href: `/notes/${id}`, publishedAt: "2026-10-28", image: null, isSample: true, searchText: id, tags };
}

describe("기록과 주제 그래프", () => {
  it("모든 실제 기록을 한 번씩 표시하고 자기 분류와 선언된 태그에만 연결한다", () => {
    const entries = listLatestContent();
    const graph = buildContentGraph(entries);
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    expect(graph.nodes.filter((node) => node.kind === "record").map((node) => node.entry?.id).toSorted())
      .toEqual(entries.map((record) => record.id).toSorted());
    expect(graph.edges.length).toBe(4 + entries.reduce((sum, record) => sum + 1 + new Set(record.tags.filter((tag) => tag.trim())).size, 0));
    for (const edge of graph.edges) {
      const record = nodes.get(edge.source)!;
      const topic = nodes.get(edge.target)!;
      if (record.kind === "self") {
        expect(topic.kind).toBe("category");
        continue;
      }
      expect(record.kind).toBe("record");
      if (topic.kind === "category") expect(topic.id).toBe(`category:${record.entry?.kind}`);
      else {
        expect(topic.kind).toBe("topic");
        expect(record.entry?.tags).toContain(topic.label);
      }
    }
    const untagged = graph.nodes.find((node) => node.entry?.title === "Color Picker Game")!;
    expect(untagged.degree).toBe(1);
    expect(graph.edges.filter((edge) => edge.source === untagged.id)).toEqual([{ source: untagged.id, target: "category:project" }]);
    for (let first = 0; first < graph.nodes.length; first++) {
      for (let second = first + 1; second < graph.nodes.length; second++) {
        expect(Math.hypot(graph.nodes[first].x - graph.nodes[second].x, graph.nodes[first].y - graph.nodes[second].y)).toBeGreaterThan(45);
      }
    }
  });

  it("입력 순서를 바꿔도 위치가 같고 입력 레코드를 수정하지 않는다", () => {
    const entries = [entry("a", ["React", "Electron"]), entry("b", ["React"]), entry("c", []), entry("d", ["SF"])];
    const original = structuredClone(entries);
    const first = buildContentGraph(entries);
    expect(buildContentGraph([...entries].reverse())).toEqual(first);
    expect(buildContentGraph(entries)).toEqual(first);
    expect(entries).toEqual(original);
    for (const node of first.nodes) {
      expect(Number.isFinite(node.x) && Number.isFinite(node.y)).toBe(true);
    }
  });

  it("같은 태그를 중복 연결하지 않고 빈 태그와 ID 충돌을 방지한다", () => {
    const graph = buildContentGraph([entry("topic:React", ["React", "React", "", "  ", "react"]), entry("record:a", ["React"])]);
    expect(new Set(graph.nodes.map((node) => node.id)).size).toBe(graph.nodes.length);
    expect(graph.nodes.filter((node) => node.kind === "topic").map((node) => node.label).toSorted()).toEqual(["React", "react"]);
    expect(graph.edges).toHaveLength(9);
    expect(graph.nodes.find((node) => node.kind === "topic" && node.label === "React")?.degree).toBe(2);
  });

  it("빈 그래프에도 나와 네 기본 분류를 두고 단일 기록은 해당 분류에만 연결한다", () => {
    const empty = buildContentGraph([]);
    expect(empty.nodes).toHaveLength(5);
    expect(empty.nodes.filter((node) => node.kind === "category").every((node) => node.degree === 0 && !node.entry)).toBe(true);
    expect(empty.nodes.find((node) => node.kind === "self")?.degree).toBe(4);
    expect(empty.edges).toHaveLength(4);
    const graph = buildContentGraph([entry("alone", [])]);
    expect(graph.nodes).toHaveLength(6);
    expect(graph.nodes[0].degree).toBe(1);
    expect(Number.isFinite(graph.nodes[0].x) && Number.isFinite(graph.nodes[0].y)).toBe(true);
    expect(graph.edges.filter((edge) => edge.source === graph.nodes[0].id)).toEqual([{ source: graph.nodes[0].id, target: "category:note" }]);
  });

  it("나를 중심에 한 번만 배치하고 네 기본 분류에만 연결한다", () => {
    const graph = buildContentGraph(listLatestContent());
    const selves = graph.nodes.filter((node) => node.kind === "self");
    expect(selves).toHaveLength(1);
    expect(selves[0]).toMatchObject({ id: "self", label: "나", degree: 4 });
    expect(selves[0].entry).toBeUndefined();
    expect(graph.edges.filter((edge) => edge.source === "self" || edge.target === "self")).toEqual([
      { source: "self", target: "category:project" },
      { source: "self", target: "category:book" },
      { source: "self", target: "category:course" },
      { source: "self", target: "category:note" },
    ]);
    const categories = graph.nodes.filter((node) => node.kind === "category");
    expect(categories.every((node) => node.x !== selves[0].x && node.y !== selves[0].y)).toBe(true);
    expect(categories.find((node) => node.id === "category:project")?.degree).toBe(8);
    expect(categories.find((node) => node.id === "category:book")?.degree).toBe(6);
    expect(categories.find((node) => node.id === "category:course")?.degree).toBe(0);
    expect(categories.find((node) => node.id === "category:note")?.degree).toBe(3);
  });

  it("분류 노드의 건수는 실제 기록 수이며 종류가 다른 분류와 연결하지 않는다", () => {
    const entries = [
      { ...entry("project", ["React"]), kind: "project" as const },
      { ...entry("book", ["SF"]), kind: "book" as const },
      { ...entry("course", []), kind: "course" as const },
      entry("note", ["React"]),
    ];
    const graph = buildContentGraph(entries);
    expect(graph.nodes.filter((node) => node.kind === "category").map(({ id, label, degree }) => ({ id, label, degree }))).toEqual([
      { id: "category:project", label: "프로젝트", degree: 1 },
      { id: "category:book", label: "책", degree: 1 },
      { id: "category:course", label: "강의 기록", degree: 1 },
      { id: "category:note", label: "노트", degree: 1 },
    ]);
    for (const node of graph.nodes.filter((node) => node.kind === "record")) {
      const categories = graph.edges.filter((edge) => edge.source === node.id && edge.target.startsWith("category:"));
      expect(categories).toEqual([{ source: node.id, target: `category:${node.entry?.kind}` }]);
    }
  });

  it("많은 합성 기록에서도 노드와 연결을 누락하거나 겹친 위치를 만들지 않는다", () => {
    const entries = Array.from({ length: 260 }, (_, index) => entry(`synthetic-${index}`, [`topic-${index % 13}`, `shared-${index % 5}`]));
    const graph = buildContentGraph(entries);
    expect(graph.nodes).toHaveLength(283);
    expect(graph.edges).toHaveLength(784);
    expect(new Set(graph.nodes.map((node) => `${node.x},${node.y}`)).size).toBe(graph.nodes.length);
    for (const node of graph.nodes) expect(Number.isFinite(node.x) && Number.isFinite(node.y)).toBe(true);
  });
});
