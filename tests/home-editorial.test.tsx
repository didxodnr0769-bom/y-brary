// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listLatestContent } from "@/lib/content/repository";
import { HomePage } from "@/pages/home";

class TestPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;

  constructor(type: string, options: PointerEventInit = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 1;
    this.pointerType = options.pointerType ?? "mouse";
  }
}

beforeEach(() => {
  // jsdom has no canvas renderer; record links and controls remain real DOM elements.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  if (typeof window.PointerEvent === "undefined") vi.stubGlobal("PointerEvent", TestPointerEvent);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function HomeRoute() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") ?? "";
  return <><HomePage query={query} /><output aria-label="현재 경로">{location.pathname}{location.search}</output></>;
}

function renderHome(path = "/") {
  return render(<MemoryRouter initialEntries={[path]}><HomeRoute /></MemoryRouter>);
}

function currentParams() {
  return new URL(screen.getByLabelText("현재 경로").textContent!, "https://example.test").searchParams;
}

function recordLinks() {
  return within(screen.getByRole("region", { name: "기록 연결 지도" })).queryAllByRole("link", { name: / 상세 보기$/ });
}

function graphSurface() {
  return screen.getByRole("group", { name: "그래프 탐색" });
}

function cameraTransform() {
  return graphSurface().querySelector("[data-graph-camera]")!.getAttribute("transform");
}

function pointerGraph() {
  const graph = graphSurface();
  vi.spyOn(graph, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 1400, 900));
  return graph;
}

const categories = [
  { kind: "project", label: "프로젝트" },
  { kind: "book", label: "책" },
  { kind: "course", label: "강의 기록" },
  { kind: "note", label: "학습 정리" },
] as const;

describe("우주형 홈의 기록 탐색", () => {
  it("중앙의 나는 작성글로 집계하지 않고 네 기본 분류와 연결을 강조한다", () => {
    renderHome();
    const self = screen.getByRole("button", { name: "나, 전체 지도 보기" });
    expect(self.textContent).toBe("나");
    expect(self.getAttribute("aria-pressed")).toBeNull();
    expect(recordLinks()).toHaveLength(listLatestContent().length);
    fireEvent.mouseOver(screen.getByRole("button", { name: "분류 책, 기록 6개" }));
    fireEvent.focus(self);
    // Repositioning the graph can fire mouseenter beneath a stationary pointer.
    fireEvent.mouseOver(screen.getByRole("button", { name: "분류 책, 기록 6개" }));
    for (const category of screen.getAllByRole("button", { name: /^분류 / })) {
      expect(category.querySelector("[data-active]")?.getAttribute("data-active")).toBe("true");
    }
    expect(graphSurface().querySelectorAll("a[data-graph-node] [data-active='true']")).toHaveLength(0);
  });

  it.each(["Enter", " "])("나를 %s로 활성화하면 선택을 해제하고 검색어를 유지한 전체 구도로 돌아온다", async (key) => {
    renderHome("/?q=worst&kind=project");
    const initialTransform = cameraTransform();
    await waitFor(() => expect(Number(graphSurface().getAttribute("data-zoom"))).toBeGreaterThan(1));
    fireEvent.keyDown(screen.getByRole("button", { name: "나, 전체 지도 보기" }), { key });
    expect(currentParams().get("kind")).toBeNull();
    expect(currentParams().get("tag")).toBeNull();
    expect(currentParams().get("q")).toBe("worst");
    expect(Number(graphSurface().getAttribute("data-zoom"))).toBe(1);
    expect(cameraTransform()).toBe(initialTransform);
    expect(recordLinks()).toHaveLength(listLatestContent("worst").length);
  });

  it("나를 클릭하면 태그 선택과 확대 상태를 함께 되돌린다", async () => {
    renderHome("/?tag=Electron");
    await waitFor(() => expect(Number(graphSurface().getAttribute("data-zoom"))).toBeGreaterThan(1));
    fireEvent.click(screen.getByRole("button", { name: "나, 전체 지도 보기" }));
    expect(currentParams().get("tag")).toBeNull();
    expect(screen.queryByRole("button", { pressed: true })).toBeNull();
    expect(Number(graphSurface().getAttribute("data-zoom"))).toBe(1);
  });

  it("실제 기록을 각각 하나의 상세 링크로 연결하고 기존 목차·목록·소개를 표시하지 않는다", () => {
    const entries = listLatestContent();
    renderHome();

    expect(recordLinks()).toHaveLength(entries.length);
    for (const entry of entries) {
      const link = screen.getByRole("link", { name: `${entry.isSample ? "Sample · " : ""}${entry.title} 상세 보기` });
      expect(link.getAttribute("href")).toBe(entry.href);
    }
    expect(graphSurface().getAttribute("tabindex")).toBe("0");
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "홈 목차" })).toBeNull();
    expect(screen.queryByRole("region", { name: "최신 기록 목록" })).toBeNull();
    expect(screen.queryByRole("complementary", { name: "기록 주제" })).toBeNull();
    expect(screen.queryByText("Personal archive")).toBeNull();
    expect(screen.queryByRole("button", { name: /최근 기록 더 보기/ })).toBeNull();
  });

  it("네 가지 기본 분류를 실제 기록 수와 함께 두고 빈 분류도 유지한다", () => {
    const entries = listLatestContent();
    renderHome();

    expect(screen.getAllByRole("button", { name: /^분류 / })).toHaveLength(categories.length);
    for (const { kind, label } of categories) {
      const count = entries.filter((entry) => entry.kind === kind).length;
      expect(screen.getByRole("button", { name: `분류 ${label}, 기록 ${count}개` }).getAttribute("aria-pressed")).toBe("false");
    }
    const emptyCourse = screen.getByRole("button", { name: "분류 강의 기록, 기록 0개" });
    fireEvent.keyDown(emptyCourse, { key: "Enter" });
    expect(currentParams().get("kind")).toBe("course");
    expect(emptyCourse.getAttribute("aria-pressed")).toBe("true");
    expect(recordLinks()).toHaveLength(entries.length);
  });

  it("분류와 주제는 서로 선택을 교체하고 검색어 및 전체 그래프를 유지한다", () => {
    const query = "worst";
    const entries = listLatestContent(query);
    renderHome(`/?q=${query}&tag=React`);
    const projectCount = entries.filter((entry) => entry.kind === "project").length;
    const reactCount = entries.filter((entry) => entry.tags.includes("React")).length;
    const project = screen.getByRole("button", { name: `분류 프로젝트, 기록 ${projectCount}개` });
    const react = screen.getByRole("button", { name: `주제 React, 기록 ${reactCount}개` });

    fireEvent.click(project);
    expect(currentParams().get("kind")).toBe("project");
    expect(currentParams().get("tag")).toBeNull();
    expect(currentParams().get("q")).toBe(query);
    expect(project.getAttribute("aria-pressed")).toBe("true");
    expect(react.getAttribute("aria-pressed")).toBe("false");
    expect(recordLinks()).toHaveLength(entries.length);

    fireEvent.click(react);
    expect(currentParams().get("tag")).toBe("React");
    expect(currentParams().get("kind")).toBeNull();
    expect(project.getAttribute("aria-pressed")).toBe("false");
    expect(react.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(project);
    fireEvent.click(project);
    expect(currentParams().get("kind")).toBeNull();
    expect(currentParams().get("tag")).toBeNull();
    expect(currentParams().get("q")).toBe(query);
  });

  it("kind 주소로 선택한 분류를 Escape 또는 빈 캔버스로 해제한다", () => {
    const entries = listLatestContent();
    const count = entries.filter((entry) => entry.kind === "book").length;
    renderHome("/?kind=book");
    const books = screen.getByRole("button", { name: `분류 책, 기록 ${count}개` });
    expect(books.getAttribute("aria-pressed")).toBe("true");
    expect(recordLinks()).toHaveLength(entries.length);

    fireEvent.keyDown(graphSurface(), { key: "Escape" });
    expect(currentParams().get("kind")).toBeNull();
    expect(books.getAttribute("aria-pressed")).toBe("false");
    fireEvent.keyDown(books, { key: " " });
    expect(books.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(graphSurface());
    expect(currentParams().get("kind")).toBeNull();
    expect(books.getAttribute("aria-pressed")).toBe("false");
  });

  it("주제 선택은 URL과 선택 상태를 갱신하며 다른 기록은 그래프에 유지한다", () => {
    const entries = listLatestContent();
    const count = entries.filter((entry) => entry.tags.includes("Electron")).length;
    renderHome();

    const topic = screen.getByRole("button", { name: `주제 Electron, 기록 ${count}개` });
    expect(topic.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(topic);
    expect(currentParams().get("tag")).toBe("Electron");
    expect(topic.getAttribute("aria-pressed")).toBe("true");
    expect(recordLinks()).toHaveLength(entries.length);
    expect(screen.getByRole("link", { name: "Color Picker Game 상세 보기" })).toBeTruthy();

    fireEvent.click(topic);
    expect(currentParams().get("tag")).toBeNull();
    expect(topic.getAttribute("aria-pressed")).toBe("false");
  });

  it("tag 주소로 직접 들어와도 해당 주제를 선택하고 Escape로 해제한다", () => {
    const count = listLatestContent().filter((entry) => entry.tags.includes("SF")).length;
    renderHome("/?tag=SF");

    expect(screen.getByRole("button", { name: `주제 SF, 기록 ${count}개` }).getAttribute("aria-pressed")).toBe("true");
    expect(recordLinks()).toHaveLength(listLatestContent().length);
    fireEvent.keyDown(graphSurface(), { key: "Escape" });
    expect(currentParams().get("tag")).toBeNull();
    expect(screen.getByRole("button", { name: `주제 SF, 기록 ${count}개` }).getAttribute("aria-pressed")).toBe("false");
  });

  it("기존 q 주소는 실제 검색 결과만 그래프로 만들고 tag 선택과 함께 사용할 수 있다", () => {
    const query = "worst";
    const expected = listLatestContent(query);
    expect(expected.length).toBeGreaterThan(0);
    renderHome(`/?q=${query}&tag=React`);

    expect(recordLinks()).toHaveLength(expected.length);
    for (const entry of expected) expect(screen.getByRole("link", { name: `${entry.title} 상세 보기` })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "My Brush 상세 보기" })).toBeNull();
    const count = expected.filter((entry) => entry.tags.includes("React")).length;
    expect(screen.getByRole("button", { name: `주제 React, 기록 ${count}개` }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.keyDown(graphSurface(), { key: "Escape" });
    expect(currentParams().get("q")).toBe(query);
    expect(currentParams().get("tag")).toBeNull();
  });

  it("확대·축소·방향키로 탐색하고 전체 보기로 기본 범위를 되찾는다", () => {
    renderHome();
    const graph = graphSurface();
    const initialZoom = Number(graph.getAttribute("data-zoom"));
    const camera = graph.querySelector("[data-graph-camera]")!;
    const initialTransform = camera.getAttribute("transform");

    fireEvent.click(screen.getByRole("button", { name: "확대" }));
    expect(Number(graph.getAttribute("data-zoom"))).toBeGreaterThan(initialZoom);
    fireEvent.click(screen.getByRole("button", { name: "축소" }));
    expect(Number(graph.getAttribute("data-zoom"))).toBeCloseTo(initialZoom);
    fireEvent.keyDown(graph, { key: "ArrowRight" });
    expect(camera.getAttribute("transform")).not.toBe(initialTransform);
    fireEvent.click(screen.getByRole("button", { name: "전체 보기" }));
    expect(Number(graph.getAttribute("data-zoom"))).toBeCloseTo(initialZoom);
    expect(camera.getAttribute("transform")).toBe(initialTransform);
  });

  it.each(["배경", "기록"] as const)("%s에서 드래그한 뒤에는 포인터 클릭을 막고 키보드 활성화는 허용한다", (origin) => {
    const entry = listLatestContent()[0];
    renderHome();
    const graph = pointerGraph();
    const record = screen.getByRole("link", { name: `${entry.title} 상세 보기` });
    const initialTransform = cameraTransform();
    const downTarget = origin === "배경" ? graph : record;

    fireEvent.pointerDown(downTarget, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1, clientX: 250, clientY: 300 });
    fireEvent.pointerMove(graph, { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1, clientX: 370, clientY: 370 });
    expect(cameraTransform()).not.toBe(initialTransform);
    fireEvent.pointerUp(graph, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 370, clientY: 370 });

    fireEvent.click(record, { button: 0, detail: 1 });
    expect(screen.getByLabelText("현재 경로").textContent).toBe("/");
    expect(graph.classList.contains("is-dragging")).toBe(false);

    // jsdom does not synthesize Enter's native link click; model its detail=0 activation.
    fireEvent.keyDown(record, { key: "Enter" });
    fireEvent.click(record, { button: 0, detail: 0 });
    fireEvent.keyUp(record, { key: "Enter" });
    expect(screen.getByLabelText("현재 경로").textContent).toBe(entry.href);
  });

  it("두 손가락 핀치 뒤 한 손가락 이동을 이어가고 취소한 포인터를 해제한다", () => {
    renderHome();
    const graph = pointerGraph();
    const initialZoom = Number(graph.getAttribute("data-zoom"));
    fireEvent.pointerDown(graph, { pointerId: 1, pointerType: "touch", button: 0, buttons: 1, clientX: 500, clientY: 400 });
    fireEvent.pointerDown(graph, { pointerId: 2, pointerType: "touch", button: 0, buttons: 1, clientX: 700, clientY: 400 });
    fireEvent.pointerMove(graph, { pointerId: 2, pointerType: "touch", button: 0, buttons: 1, clientX: 900, clientY: 400 });
    const pinchZoom = Number(graph.getAttribute("data-zoom"));
    const pinchTransform = cameraTransform();
    expect(pinchZoom).toBeGreaterThan(initialZoom);

    fireEvent.pointerUp(graph, { pointerId: 2, pointerType: "touch", button: 0, clientX: 900, clientY: 400 });
    fireEvent.pointerMove(graph, { pointerId: 1, pointerType: "touch", button: 0, buttons: 1, clientX: 540, clientY: 460 });
    expect(Number(graph.getAttribute("data-zoom"))).toBeCloseTo(pinchZoom);
    expect(cameraTransform()).not.toBe(pinchTransform);

    fireEvent.pointerCancel(graph, { pointerId: 1, pointerType: "touch", button: 0, clientX: 540, clientY: 460 });
    const cancelledTransform = cameraTransform();
    expect(graph.classList.contains("is-dragging")).toBe(false);
    fireEvent.pointerMove(graph, { pointerId: 1, pointerType: "touch", button: 0, buttons: 1, clientX: 800, clientY: 600 });
    expect(cameraTransform()).toBe(cancelledTransform);

    fireEvent.pointerDown(graph, { pointerId: 3, pointerType: "touch", button: 0, buttons: 1, clientX: 600, clientY: 500 });
    fireEvent.pointerMove(graph, { pointerId: 3, pointerType: "touch", button: 0, buttons: 1, clientX: 650, clientY: 550 });
    expect(cameraTransform()).not.toBe(cancelledTransform);
    fireEvent.pointerUp(graph, { pointerId: 3, pointerType: "touch", button: 0, clientX: 650, clientY: 550 });
    expect(graph.classList.contains("is-dragging")).toBe(false);
  });

  it("분류 선택 시 연결된 기록 쪽으로 확대하고 전체 보기로 원래 범위에 돌아온다", async () => {
    const count = listLatestContent().filter((entry) => entry.kind === "book").length;
    renderHome();
    const graph = graphSurface();
    const initialTransform = cameraTransform();
    fireEvent.click(screen.getByRole("button", { name: `분류 책, 기록 ${count}개` }));

    await waitFor(() => expect(Number(graph.getAttribute("data-zoom"))).toBeGreaterThan(1));
    expect(cameraTransform()).not.toBe(initialTransform);
    fireEvent.click(screen.getByRole("button", { name: "전체 보기" }));
    expect(Number(graph.getAttribute("data-zoom"))).toBe(1);
    expect(cameraTransform()).toBe(initialTransform);
  });

  it("기록의 링크를 누르면 해당 상세 경로로 이동한다", () => {
    const entry = listLatestContent()[0];
    renderHome();
    fireEvent.click(screen.getByRole("link", { name: `${entry.title} 상세 보기` }));
    expect(screen.getByLabelText("현재 경로").textContent).toBe(entry.href);
  });

  it("검색 결과가 없을 때 임의 기록 대신 빈 안내를 보여준다", () => {
    renderHome("/?q=___없는기록_회귀검증___");
    expect(recordLinks()).toHaveLength(0);
    for (const { label } of categories) expect(screen.getByRole("button", { name: `분류 ${label}, 기록 0개` })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "기록 연결 지도" })).getByRole("status").textContent?.trim().length).toBeGreaterThan(0);
  });

  it("없는 주제를 알리되 다른 실제 기록을 삭제하거나 예시 데이터를 추가하지 않는다", () => {
    renderHome("/?tag=___없는주제_회귀검증___");
    expect(recordLinks()).toHaveLength(listLatestContent().length);
    expect(within(screen.getByRole("region", { name: "기록 연결 지도" })).getByRole("status").textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { pressed: true })).toBeNull();
  });
});
