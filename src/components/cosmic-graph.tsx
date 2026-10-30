import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { CosmicStars } from "@/components/cosmic-stars";
import type { ContentGraph, GraphNode } from "@/lib/content/graph";
import { assetUrl } from "@/lib/urls";

type Point = { x: number; y: number };
type Camera = Point & { zoom: number };
type Gesture = { camera: Camera; start: Point; distance: number };
const initialCamera: Camera = { x: 0, y: 0, zoom: 1 };
const clampZoom = (zoom: number) => Math.max(0.35, Math.min(6, zoom));
const preferredTopics = ["Electron", "React", "SF", "음악", "자기계발", "경제"];

function compactLabel(text: string, maximum: number) {
  let width = 0, result = "";
  for (const character of text) {
    const next = character.charCodeAt(0) < 128 ? 7 : 12;
    if (width + next > maximum) return { text: result + "…", width: width + 12 };
    result += character; width += next;
  }
  return { text: result, width };
}

function ControlIcon({ type }: { type: "plus" | "minus" | "fit" | "info" }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    {type === "fit" ? <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
      : type === "info" ? <><circle cx="12" cy="12" r="8" /><path d="M12 11v5m0-9v.5" /></>
      : <><path d="M5 12h14" />{type === "plus" ? <path d="M12 5v14" /> : null}</>}
  </svg>;
}

export function CosmicGraph({ graph, activeTag, activeKind, onSelectTopic, onSelectCategory }: {
  graph: ContentGraph; activeTag: string; activeKind: string;
  onSelectTopic: (topic: string | null) => void; onSelectCategory: (kind: string | null) => void;
}) {
  const stage = useRef<HTMLDivElement>(null), surface = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null), dragged = useRef(false);
  const [viewport, setViewport] = useState({ width: 1400, height: 900 });
  const [camera, setCamera] = useState<Camera>(initialCamera);
  const [dragging, setDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const instructionsId = useId();

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    function measure() {
      const { width, height } = element!.getBoundingClientRect();
      if (!width || !height) return;
      setViewport((previous) => previous.width === width && previous.height === height ? previous : { width, height });
    }
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    const timer = window.setTimeout(measure, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", measure); };
  }, []);

  // Reorient the constellation on portrait screens without compressing it into a thin strip.
  const nodes = useMemo(() => graph.nodes.map((node) => viewport.width < 600 ? { ...node, x: node.y, y: node.x } : node), [graph.nodes, viewport.width]);
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const bounds = useMemo(() => {
    if (!nodes.length) return { x: 700, y: 450, width: 1000, height: 700 };
    const xs = nodes.map((node) => node.x), ys = nodes.map((node) => node.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const self = nodes.find((node) => node.kind === "self");
    const x = self?.x ?? (minX + maxX) / 2, y = self?.y ?? (minY + maxY) / 2;
    return { x, y, width: Math.max(x - minX, maxX - x) * 2, height: Math.max(y - minY, maxY - y) * 2 };
  }, [nodes]);
  const padding = viewport.width < 600 ? 72 : 150;
  const fitScale = Math.min((viewport.width - padding) / Math.max(bounds.width, 140), (viewport.height - 120) / Math.max(bounds.height, 140), 2);
  const scale = Math.max(fitScale, 0.08) * camera.zoom;
  const translate = { x: viewport.width / 2 + camera.x - bounds.x * scale, y: viewport.height / 2 + camera.y - bounds.y * scale };
  const selected = activeTag ? nodes.find((node) => node.kind === "topic" && node.label === activeTag)
    : nodes.find((node) => node.kind === "category" && node.id === `category:${activeKind}`);
  const activeId = (keyboardFocus ? focusedId : hoveredId ?? focusedId) ?? selected?.id;
  const warmId = activeId ?? nodes.find((node) => node.kind === "self")?.id;
  const neighbors = useMemo(() => {
    const connected = new Set<string>(warmId ? [warmId] : []);
    for (const edge of graph.edges) {
      if (edge.source === warmId) connected.add(edge.target);
      if (edge.target === warmId) connected.add(edge.source);
    }
    return connected;
  }, [graph.edges, warmId]);

  useEffect(() => {
    if (!selected || !selected.degree) return;
    const ids = new Set([selected.id]);
    for (const edge of graph.edges) {
      if (edge.source === selected.id) ids.add(edge.target);
      if (edge.target === selected.id) ids.add(edge.source);
    }
    const neighborhood = nodes.filter((node) => ids.has(node.id) && node.kind !== "self");
    const xs = neighborhood.map((node) => node.x), ys = neighborhood.map((node) => node.y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const zoom = Math.max(1, Math.min(4,
      Math.max(viewport.width - 180, viewport.width * 0.5) / Math.max(right - left, 120) / fitScale,
      Math.max(viewport.height - 160, viewport.height * 0.5) / Math.max(bottom - top, 120) / fitScale));
    const timer = window.setTimeout(() => setCamera({ zoom,
      x: (bounds.x - (left + right) / 2) * fitScale * zoom,
      y: (bounds.y - (top + bottom) / 2) * fitScale * zoom,
    }), 0);
    return () => window.clearTimeout(timer);
  }, [selected, nodes, graph.edges, viewport.width, viewport.height, fitScale, bounds.x, bounds.y]);

  const labels = useMemo(() => {
    type Label = { text: string; x: number; y: number; anchor: "start" | "end" };
    const result = new Map<string, Label>();
    const rectangles: { x: number; y: number; width: number; height: number }[] = [];
    const candidates = nodes.filter((node) => node.kind === "self" || node.kind === "category" || node.id === activeId || (activeId && neighbors.has(node.id)) || camera.zoom > 1.8
      || (node.kind === "topic" && preferredTopics.includes(node.label)) || node.label === "My Brush" || node.label === "WorstCompare")
      .toSorted((a, b) => {
        const priority = (node: GraphNode) => node.id === activeId ? 0 : node.kind === "self" ? 1 : node.kind === "category" ? 2 : activeId && neighbors.has(node.id) ? 3 : node.kind === "topic" ? 4 : 5;
        return priority(a) - priority(b) || b.degree - a.degree || a.id.localeCompare(b.id);
      });
    for (const node of candidates) {
      const x = node.x * scale + translate.x, y = node.y * scale + translate.y;
      if (x < 10 || y < 14 || x > viewport.width - 10 || y > viewport.height - 58) continue;
      const label = compactLabel((node.entry?.isSample ? "Sample · " : "") + node.label, Math.min(viewport.width * 0.45, 210));
      const placements: Label[] = [{ text: label.text, x: 14, y: 5, anchor: "start" }, { text: label.text, x: -14, y: 5, anchor: "end" }, { text: label.text, x: -label.width / 2, y: -15, anchor: "start" }, { text: label.text, x: -label.width / 2, y: 27, anchor: "start" }];
      for (const placement of placements) {
        const rectangle = { x: x + placement.x - (placement.anchor === "end" ? label.width : 0), y: y + placement.y - 13, width: label.width, height: 18 };
        if (rectangle.x < 10 || rectangle.y < 8 || rectangle.x + rectangle.width > viewport.width - 10) continue;
        if (rectangles.some((other) => rectangle.x < other.x + other.width + 8 && rectangle.x + rectangle.width + 8 > other.x && rectangle.y < other.y + other.height + 5 && rectangle.y + rectangle.height + 5 > other.y)) continue;
        rectangles.push(rectangle); result.set(node.id, placement); break;
      }
    }
    return result;
  }, [activeId, camera.zoom, neighbors, nodes, scale, translate.x, translate.y, viewport.height, viewport.width]);

  const zoomAt = useCallback((factor: number, focal: Point = { x: 0, y: 0 }) => {
    setCamera((previous) => {
      const zoom = clampZoom(previous.zoom * factor), ratio = zoom / previous.zoom;
      return { zoom, x: focal.x - (focal.x - previous.x) * ratio, y: focal.y - (focal.y - previous.y) * ratio };
    });
  }, []);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    function wheel(event: WheelEvent) {
      event.preventDefault();
      const rectangle = element!.getBoundingClientRect();
      zoomAt(Math.exp(-Math.max(-200, Math.min(200, event.deltaY)) * 0.003), { x: event.clientX - rectangle.left - rectangle.width / 2, y: event.clientY - rectangle.top - rectangle.height / 2 });
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [zoomAt]);

  function rebaseGesture() {
    const values = [...pointers.current.values()];
    if (!values.length) { gesture.current = null; return; }
    const first = values[0], second = values[1];
    gesture.current = { camera, start: second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } : first,
      distance: second ? Math.max(Math.hypot(first.x - second.x, first.y - second.y), 1) : 0 };
  }
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    setKeyboardFocus(false);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragged.current = false; rebaseGesture();
    if (!(event.target as Element).closest("[data-graph-node]")) event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    if (keyboardFocus) setKeyboardFocus(false);
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const [first, second] = [...pointers.current.values()], origin = gesture.current;
    if (second && origin.distance) {
      const rectangle = event.currentTarget.getBoundingClientRect();
      const midpoint = { x: (first.x + second.x) / 2 - rectangle.left - rectangle.width / 2, y: (first.y + second.y) / 2 - rectangle.top - rectangle.height / 2 };
      const start = { x: origin.start.x - rectangle.left - rectangle.width / 2, y: origin.start.y - rectangle.top - rectangle.height / 2 };
      const zoom = clampZoom(origin.camera.zoom * Math.hypot(first.x - second.x, first.y - second.y) / origin.distance), ratio = zoom / origin.camera.zoom;
      setCamera({ zoom, x: midpoint.x - (start.x - origin.camera.x) * ratio, y: midpoint.y - (start.y - origin.camera.y) * ratio });
    } else {
      const dx = first.x - origin.start.x, dy = first.y - origin.start.y;
      if (Math.hypot(dx, dy) < 4 && !dragged.current) return;
      setCamera({ ...origin.camera, x: origin.camera.x + dx, y: origin.camera.y + dy });
    }
    dragged.current = true; setDragging(true); event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function pointerEnd(event: PointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type === "pointercancel") dragged.current = true;
    rebaseGesture(); if (!pointers.current.size) setDragging(false);
  }
  function keyboard(event: KeyboardEvent<SVGSVGElement>) {
    setKeyboardFocus(true);
    if (event.defaultPrevented) return;
    const moves: Record<string, Point> = { ArrowLeft: { x: 60, y: 0 }, ArrowRight: { x: -60, y: 0 }, ArrowUp: { x: 0, y: 60 }, ArrowDown: { x: 0, y: -60 } };
    if (moves[event.key]) {
      event.preventDefault(); setCamera((previous) => ({ ...previous, x: previous.x + moves[event.key].x, y: previous.y + moves[event.key].y }));
    } else if (event.key === "+" || event.key === "=" || event.key === "-") {
      event.preventDefault(); zoomAt(event.key === "-" ? 1 / 1.25 : 1.25);
    } else if (event.key === "0" || event.key === "Home") {
      event.preventDefault(); setCamera(initialCamera);
    } else if (event.key === "Escape") {
      event.preventDefault(); onSelectTopic(null); setHoveredId(null); setFocusedId(null); surface.current?.focus();
    }
  }
  function focusNode(node: GraphNode) {
    setHoveredId(null);
    setKeyboardFocus(true);
    setFocusedId(node.id);
    const x = node.x * scale + translate.x, y = node.y * scale + translate.y;
    if (x < 42 || y < 42 || x > viewport.width - 42 || y > viewport.height - 70) setCamera((previous) => ({ ...previous, x: (bounds.x - node.x) * scale, y: (bounds.y - node.y) * scale }));
  }
  function selectNode(node: GraphNode) {
    if (node.kind === "self") {
      onSelectTopic(null);
      setCamera(initialCamera);
      setHoveredId(null);
      setFocusedId(node.id);
    } else if (node.kind === "category") onSelectCategory(selected?.id === node.id ? null : node.id.slice("category:".length));
    else onSelectTopic(selected?.id === node.id ? null : node.label);
  }
  function nodeContents(node: GraphNode) {
    const label = labels.get(node.id), bright = neighbors.has(node.id);
    return <g transform={`translate(${node.x} ${node.y}) scale(${1 / scale})`} className={`graph-star graph-star-${node.kind}${bright ? " is-warm" : ""}`} data-active={activeId ? bright : undefined}>
      <circle className="graph-node-hit" r={node.kind === "self" ? 24 : viewport.width < 600 ? 13 : 17} />
      <circle className="graph-node-halo" r={node.kind === "self" ? 44 : node.kind === "category" ? 32 : node.kind === "topic" ? 21 : 13} />
      <circle className="graph-node-core" r={node.kind === "self" ? 10 : node.kind === "category" ? 7.5 : node.kind === "topic" ? Math.min(5.8, 3.4 + node.degree * 0.35) : 3.3} />
      <circle className="graph-node-focus" r={node.kind === "self" ? 16 : node.kind === "category" ? 13 : 10} />
      {label ? <text className="graph-node-label" x={label.x} y={label.y} textAnchor={label.anchor} aria-hidden="true">{label.text}</text> : null}
    </g>;
  }

  return <div className="graph-stage" ref={stage}>
    <CosmicStars />
    <p id={instructionsId} className="graph-sr-only">드래그 또는 방향키로 이동하고, 휠·두 손가락·더하기와 빼기 키로 확대하거나 축소합니다. Tab으로 별을 선택하고 Enter로 기록을 엽니다. 주제를 선택하면 연결된 기록이 강조됩니다. 나를 누르면 전체 지도로 돌아갑니다. Escape로 선택을 해제하고 0으로 전체를 봅니다.</p>
    <svg ref={surface} className={`graph-surface${dragging ? " is-dragging" : ""}`} role="group" aria-label="그래프 탐색" aria-describedby={instructionsId} tabIndex={0}
      width={viewport.width} height={viewport.height} viewBox={`0 0 ${viewport.width} ${viewport.height}`} data-zoom={camera.zoom.toFixed(3)}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onKeyDown={keyboard}
      onClickCapture={(event) => { if (dragged.current && event.detail > 0) { event.preventDefault(); event.stopPropagation(); } }}
      onClick={(event) => { if (!(event.target as Element).closest("[data-graph-node]")) { onSelectTopic(null); surface.current?.focus(); } }}>
      <g data-graph-camera transform={`translate(${translate.x} ${translate.y}) scale(${scale})`}>
        <g aria-hidden="true" className="graph-edges">{graph.edges.map((edge) => {
          const from = byId.get(edge.source)!, to = byId.get(edge.target)!, bright = edge.source === warmId || edge.target === warmId;
          return <line key={`${edge.source}|${edge.target}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" className={`${bright ? "is-warm" : ""}${from.kind === "self" ? " is-self-link" : ""}`} data-active={activeId ? bright : undefined} />;
        })}</g>
        {nodes.map((node) => node.kind === "record" && node.entry ? (
          <Link key={node.id} to={node.entry.href} data-graph-node={node.id} className="graph-node" aria-label={`${node.entry.isSample ? "Sample · " : ""}${node.label} 상세 보기`}
            onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => focusNode(node)} onBlur={() => setFocusedId(null)}>
            {nodeContents(node)}
          </Link>
        ) : (
          <g key={node.id} role="button" tabIndex={0} data-graph-node={node.id} className="graph-node" aria-label={node.kind === "self" ? "나, 전체 지도 보기" : `${node.kind === "category" ? "분류" : "주제"} ${node.label}, 기록 ${node.degree}개`} aria-pressed={node.kind === "self" ? undefined : selected?.id === node.id}
            onClick={() => selectNode(node)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectNode(node); } }}
            onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => focusNode(node)} onBlur={() => setFocusedId(null)}>
            {nodeContents(node)}
          </g>
        ))}
      </g>
    </svg>
    {!nodes.some((node) => node.kind === "record") || ((activeTag || activeKind) && !selected) ? <div className="graph-empty" role="status">
      <p>{!nodes.some((node) => node.kind === "record") ? "조건에 맞는 기록이 없습니다." : "연결된 주제가 없습니다."}</p><Link to="/">전체 기록 보기</Link>
    </div> : null}
    <a className="graph-font-notice" href={assetUrl("/notices/maplestory-font.txt")} target="_blank" rel="noreferrer" aria-label="메이플스토리 서체 저작권 안내" title="메이플스토리 서체 저작권 안내"><ControlIcon type="info" /></a>
    <a className="graph-font-notice graph-analytics-notice" href={assetUrl("/notices/analytics.html")} target="_blank" rel="noreferrer">방문 통계 안내</a>
    <div className="graph-controls" role="group" aria-label="화면 조절">
      <button type="button" aria-label="확대" title="확대 (+)" onClick={() => zoomAt(1.25)} disabled={camera.zoom >= 6}><ControlIcon type="plus" /></button>
      <button type="button" aria-label="축소" title="축소 (−)" onClick={() => zoomAt(1 / 1.25)} disabled={camera.zoom <= 0.35}><ControlIcon type="minus" /></button>
      <button type="button" aria-label="전체 보기" title="전체 보기 (0)" onClick={() => setCamera(initialCamera)}><ControlIcon type="fit" /></button>
    </div>
  </div>;
}
