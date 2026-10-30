import type { LatestContent } from "@/lib/content/repository";

export type GraphNode = {
  id: string;
  kind: "record" | "topic" | "category" | "self";
  label: string;
  x: number;
  y: number;
  degree: number;
  entry?: LatestContent;
};

export type GraphEdge = { source: string; target: string };
export type ContentGraph = { nodes: GraphNode[]; edges: GraphEdge[] };

type Point = { x: number; y: number };
type CategoryGroup = { indices: number[]; radius: number; center: Point };
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const categories = [
  { kind: "project", label: "프로젝트", x: 0.25, y: 0.3 },
  { kind: "book", label: "책", x: 0.77, y: 0.35 },
  { kind: "course", label: "강의 기록", x: 0.72, y: 0.8 },
  { kind: "note", label: "노트", x: 0.25, y: 0.78 },
] as const;

function seed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0) / 4294967296;
}

/** Settles a component once; rendering and pointer movement never run a physics loop. */
function settleComponent(indices: number[], nodes: GraphNode[], adjacency: number[][], radius: number) {
  if (indices.length === 1) {
    nodes[indices[0]].x = 0;
    nodes[indices[0]].y = 0;
    return radius;
  }
  const localIndex = new Map(indices.map((index, local) => [index, local]));
  const localEdges = indices.flatMap((index, local) => adjacency[index]
    .filter((neighbor) => neighbor > index && localIndex.has(neighbor))
    .map((neighbor) => [local, localIndex.get(neighbor)!] as const));
  const anchor = indices.findIndex((index) => nodes[index].kind === "category");
  const points = indices.map((index, local) => {
    if (local === anchor) return { x: 0, y: 0 };
    const angle = local * goldenAngle + seed(nodes[index].id) * 0.45;
    const distance = Math.sqrt((local + 0.5) / indices.length) * radius * 0.8;
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  });
  const ideal = 44;
  const iterations = Math.max(52, 140 - Math.floor(indices.length / 5));

  for (let iteration = 0; iteration < iterations; iteration++) {
    const forces = points.map(() => ({ x: 0, y: 0 }));
    for (let first = 0; first < points.length; first++) {
      for (let second = first + 1; second < points.length; second++) {
        const dx = points[first].x - points[second].x;
        const dy = points[first].y - points[second].y;
        const distance = Math.max(Math.hypot(dx, dy), 0.1);
        const force = Math.min(ideal * ideal / distance, 240);
        const fx = dx / distance * force;
        const fy = dy / distance * force;
        forces[first].x += fx;
        forces[first].y += fy;
        forces[second].x -= fx;
        forces[second].y -= fy;
      }
    }
    for (const [first, second] of localEdges) {
      const dx = points[first].x - points[second].x;
      const dy = points[first].y - points[second].y;
      const distance = Math.max(Math.hypot(dx, dy), 0.1);
      const force = distance * distance / ideal * 0.35;
      const fx = dx / distance * force;
      const fy = dy / distance * force;
      forces[first].x -= fx;
      forces[first].y -= fy;
      forces[second].x += fx;
      forces[second].y += fy;
    }
    const temperature = 12 * (1 - iteration / iterations) + 0.12;
    points.forEach((point, index) => {
      if (index === anchor) return;
      const fx = forces[index].x - point.x * 0.035;
      const fy = forces[index].y - point.y * 0.035;
      const magnitude = Math.hypot(fx, fy) || 1;
      point.x += fx / magnitude * Math.min(magnitude, temperature);
      point.y += fy / magnitude * Math.min(magnitude, temperature);
    });
  }

  const extent = Math.max(...points.map((point) => Math.hypot(point.x, point.y)), 1);
  const scale = radius / extent;
  points.forEach((point) => {
    point.x *= scale;
    point.y *= scale;
  });
  // Separate hit targets after normalizing the layout, without shrinking them again.
  const clearance = indices.length <= 80 ? 48 : 28;
  for (let iteration = 0; iteration < 100; iteration++) {
    let maximumOverlap = 0;
    for (let first = 0; first < points.length; first++) {
      for (let second = first + 1; second < points.length; second++) {
        let dx = points[second].x - points[first].x;
        let dy = points[second].y - points[first].y;
        if (dx === 0 && dy === 0) {
          dx = Math.cos(second * goldenAngle);
          dy = Math.sin(second * goldenAngle);
        }
        const distance = Math.hypot(dx, dy);
        const overlap = clearance - distance;
        if (overlap <= 0) continue;
        maximumOverlap = Math.max(maximumOverlap, overlap);
        const movement = (overlap + 0.01) / (first === anchor || second === anchor ? 1 : 2);
        const fx = dx / distance * movement;
        const fy = dy / distance * movement;
        if (first !== anchor) {
          points[first].x -= fx;
          points[first].y -= fy;
        }
        if (second !== anchor) {
          points[second].x += fx;
          points[second].y += fy;
        }
      }
    }
    if (maximumOverlap < 0.001) break;
  }
  indices.forEach((index, local) => {
    nodes[index].x = points[local].x;
    nodes[index].y = points[local].y;
  });
  return Math.max(radius, ...indices.map((index) => Math.hypot(nodes[index].x, nodes[index].y))) + 1;
}

function positionCategories(nodes: GraphNode[], adjacency: number[][]) {
  const owner = nodes.map((node, index) => {
    if (node.kind === "record") return node.entry!.kind;
    if (node.kind === "category") return node.id.slice("category:".length);
    if (node.kind === "self") return null;
    const weights = new Map<string, number>();
    for (const neighbor of adjacency[index]) {
      const kind = nodes[neighbor].entry?.kind;
      if (kind) weights.set(kind, (weights.get(kind) ?? 0) + 1);
    }
    return categories.toSorted((a, b) => (weights.get(b.kind) ?? 0) - (weights.get(a.kind) ?? 0))[0].kind;
  });
  const groups: CategoryGroup[] = categories.map(({ kind }) => {
    const indices = nodes.map((_, index) => index).filter((index) => owner[index] === kind);
    indices.sort((a, b) => nodes[b].degree - nodes[a].degree || nodes[a].id.localeCompare(nodes[b].id, "en"));
    const radius = indices.length === 1 ? 0 : Math.max(94, Math.sqrt(indices.length) * 46);
    return { indices, radius: settleComponent(indices, nodes, adjacency, radius), center: { x: 0, y: 0 } };
  });
  const worldScale = Math.max(1, ...groups.map((group) => group.radius / 270));
  const width = 1400 * worldScale;
  const height = 900 * worldScale;
  const self = nodes.find((node) => node.kind === "self")!;
  self.x = width / 2;
  self.y = height / 2;
  groups.forEach((group, index) => {
    group.center = { x: categories[index].x * width, y: categories[index].y * height };
    for (const nodeIndex of group.indices) {
      nodes[nodeIndex].x += group.center.x;
      nodes[nodeIndex].y += group.center.y;
    }
  });
  nodes.forEach((node) => {
    node.x = Math.round(node.x * 1000) / 1000;
    node.y = Math.round(node.y * 1000) / 1000;
  });
}

/** Links each record to its category and declared tags; structural nodes never represent invented posts. */
export function buildContentGraph(entries: LatestContent[]): ContentGraph {
  const records = [...new Map(entries.map((entry) => [entry.id, entry])).values()]
    .toSorted((a, b) => a.id.localeCompare(b.id, "en"));
  const recordId = (id: string) => `record:${encodeURIComponent(id)}`;
  const topicId = (tag: string) => `topic:${encodeURIComponent(tag)}`;
  const tags = [...new Set(records.flatMap((entry) => entry.tags.filter((tag) => tag.trim().length > 0)))]
    .toSorted((a, b) => a.localeCompare(b, "en"));
  const nodes: GraphNode[] = [
    ...records.map((entry) => ({ id: recordId(entry.id), kind: "record" as const, label: entry.title, x: 0, y: 0, degree: 0, entry })),
    ...tags.map((tag) => ({ id: topicId(tag), kind: "topic" as const, label: tag, x: 0, y: 0, degree: 0 })),
    ...categories.map(({ kind, label }) => ({ id: `category:${kind}`, kind: "category" as const, label, x: 0, y: 0, degree: 0 })),
    { id: "self", kind: "self", label: "나", x: 0, y: 0, degree: 0 },
  ];
  const edges = [...records.flatMap((entry) => [
    { source: recordId(entry.id), target: `category:${entry.kind}` },
    ...[...new Set(entry.tags.filter((tag) => tag.trim().length > 0))]
      .toSorted((a, b) => a.localeCompare(b, "en"))
      .map((tag) => ({ source: recordId(entry.id), target: topicId(tag) })),
  ]), ...categories.map(({ kind }) => ({ source: "self", target: `category:${kind}` }))];
  const byId = new Map(nodes.map((node, index) => [node.id, index]));
  const adjacency: number[][] = nodes.map(() => []);
  for (const edge of edges) {
    const source = byId.get(edge.source)!;
    const target = byId.get(edge.target)!;
    adjacency[source].push(target);
    adjacency[target].push(source);
  }
  nodes.forEach((node, index) => {
    node.degree = node.kind === "category"
      ? adjacency[index].filter((neighbor) => nodes[neighbor].kind === "record").length
      : adjacency[index].length;
  });
  positionCategories(nodes, adjacency);
  return { nodes, edges };
}
