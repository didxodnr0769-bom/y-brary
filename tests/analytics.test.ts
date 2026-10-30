// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAnalytics } from "@/lib/analytics";

const measurementId = "G-TEST12345";
const options = {
  measurementId,
  siteUrl: "https://archive.example.test",
  basePath: "/y-brary/",
  production: true,
};
const exclusionKey = "ybrary.analytics.disabled";

type TestBrowser = {
  location: URL;
  localStorage: Pick<Storage, "getItem" | "setItem" | "removeItem">;
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

let browser: TestBrowser;
let stored: Map<string, string>;

function commands() {
  return (browser.dataLayer ?? []).map((entry) => Array.from(entry));
}

function events(name: string) {
  return commands().filter(([command, event]) => command === "event" && event === name);
}

beforeEach(() => {
  stored = new Map();
  browser = {
    location: new URL("https://archive.example.test/y-brary/?q=private-search#private-fragment"),
    localStorage: {
      getItem: vi.fn((key: string) => stored.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => { stored.set(key, value); }),
      removeItem: vi.fn((key: string) => { stored.delete(key); }),
    },
  };
  vi.stubGlobal("window", browser);
  vi.spyOn(document, "referrer", "get").mockReturnValue("https://reader:private-password@referrer.example.test/source?q=private-referrer#private-hash");
});

afterEach(() => {
  document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtag/js"]').forEach((script) => script.remove());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GA4 운영 환경 제한", () => {
  it.each([
    { name: "개발 빌드", overrides: { production: false } },
    { name: "없는 측정 ID", overrides: { measurementId: "" } },
    { name: "잘못된 측정 ID", overrides: { measurementId: "GT-TEST12345" } },
    { name: "HTTPS가 아닌 운영 주소", overrides: { siteUrl: "http://archive.example.test" } },
    { name: "다른 운영 origin", overrides: { siteUrl: "https://other.example.test" } },
    { name: "운영 경로 밖", overrides: { basePath: "/other/" } },
    { name: "이름만 비슷한 운영 경로", overrides: { basePath: "/y-brary-preview/" } },
  ])("$name에서는 스크립트와 이벤트를 만들지 않는다", ({ overrides }) => {
    const analytics = createAnalytics({ ...options, ...overrides });
    analytics.pageView("/", "홈 | YBrary");
    analytics.projectLink("sample", "site", "https://project.example.test/");

    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    expect(commands()).toEqual([]);
  });
});

describe("GA4 최소 측정", () => {
  it("동일 경로 중복은 제외하고 A → B → A 방문은 각각 한 번 기록한다", () => {
    const analytics = createAnalytics(options);
    analytics.pageView("/", "홈 | YBrary");
    analytics.pageView("/", "홈 | YBrary");
    analytics.pageView("/projects", "프로젝트 | YBrary");
    analytics.pageView("/projects?q=private-filter#private-hash", "프로젝트 | YBrary");
    analytics.pageView("/", "홈 | YBrary");

    expect(events("page_view").map(([, , page]) => page)).toEqual([
      expect.objectContaining({ page_location: "https://archive.example.test/y-brary/", page_referrer: "https://referrer.example.test/source" }),
      expect.objectContaining({ page_location: "https://archive.example.test/y-brary/projects", page_referrer: "https://archive.example.test/y-brary/" }),
      expect.objectContaining({ page_location: "https://archive.example.test/y-brary/", page_referrer: "https://archive.example.test/y-brary/projects" }),
    ]);
    expect(document.querySelectorAll('script[src*="googletagmanager.com"]')).toHaveLength(1);
    const script = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager.com"]')!;
    expect(script.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    expect(script.async).toBe(true);
    expect(script.referrerPolicy).toBe("no-referrer");
  });

  it("전역·스트림·페이지 이벤트에 정제한 URL을 유지하고 광고와 자동 페이지 조회를 끈다", () => {
    const analytics = createAnalytics(options);
    analytics.pageView("/projects?q=private-search#private-fragment", "프로젝트 | YBrary");
    analytics.pageView("/books?category=private-category#private-fragment", "책 | YBrary");

    const allCommands = commands();
    const configs = allCommands.filter(([command]) => command === "config");
    expect(configs).toHaveLength(2);
    expect(configs[0]).toEqual(["config", measurementId, {
      page_location: "https://archive.example.test/y-brary/projects",
      page_referrer: "https://referrer.example.test/source",
      page_title: "프로젝트 | YBrary",
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    }]);
    expect(configs[1][2]).toEqual(expect.objectContaining({ update: true, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false }));
    expect(allCommands.filter(([command]) => command === "set").map(([, page]) => page)).toEqual([
      expect.objectContaining({ page_location: "https://archive.example.test/y-brary/projects", page_referrer: "https://referrer.example.test/source" }),
      expect.objectContaining({ page_location: "https://archive.example.test/y-brary/books", page_referrer: "https://archive.example.test/y-brary/projects" }),
    ]);
    expect(JSON.stringify(allCommands)).not.toMatch(/private-|reader:|\?q=|\?category=|#/);
  });

  it("초기화 전 클릭과 잘못된 URL은 제외하고 외부 클릭에는 현재 페이지와 정제한 링크만 넣는다", () => {
    const analytics = createAnalytics(options);
    analytics.projectLink("sample", "site", "https://project.example.test/");
    expect(commands()).toEqual([]);
    analytics.pageView("/projects/sample", "테스트 프로젝트 | YBrary");
    analytics.projectLink("sample", "github", "https://reader:private-password@github.com/example/sample?token=private-token#private-anchor");
    analytics.projectLink("sample", "site", "https://project.example.test/demo?q=private-query#private-hash");
    analytics.projectLink("sample", "site", "javascript:alert(1)");

    expect(events("click").map(([, , payload]) => payload)).toEqual([
      {
        page_location: "https://archive.example.test/y-brary/projects/sample",
        page_referrer: "https://referrer.example.test/source",
        page_title: "테스트 프로젝트 | YBrary",
        send_to: measurementId,
        link_id: "sample:github",
        link_domain: "github.com",
        link_url: "https://github.com/example/sample",
        outbound: true,
      },
      expect.objectContaining({ link_id: "sample:site", link_url: "https://project.example.test/demo", page_location: "https://archive.example.test/y-brary/projects/sample" }),
    ]);
    expect(JSON.stringify(commands())).not.toMatch(/private-|reader:/);
  });
});

describe("본인 방문 제외", () => {
  it("측정 ID를 등록하기 전의 제외 선택도 활성화 후에 유지한다", () => {
    browser.location = new URL("https://archive.example.test/y-brary/?analytics=off");
    createAnalytics({ ...options, measurementId: "" }).pageView("/", "홈 | YBrary");
    expect(stored.get(exclusionKey)).toBe("1");

    browser.location = new URL("https://archive.example.test/y-brary/");
    createAnalytics(options).pageView("/", "홈 | YBrary");
    expect(commands()).toEqual([]);
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });

  it("off 선택을 저장하고 재방문에도 제외하며 on으로 복원한다", () => {
    browser.location = new URL("https://archive.example.test/y-brary/?analytics=off");
    createAnalytics(options).pageView("/", "홈 | YBrary");
    expect(stored.get(exclusionKey)).toBe("1");
    expect(browser[`ga-disable-${measurementId}`]).toBe(true);

    browser.location = new URL("https://archive.example.test/y-brary/");
    createAnalytics(options).pageView("/", "홈 | YBrary");
    expect(commands()).toEqual([]);
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();

    browser.location = new URL("https://archive.example.test/y-brary/?analytics=on");
    createAnalytics(options).pageView("/", "홈 | YBrary");
    expect(stored.has(exclusionKey)).toBe(false);
    expect(browser[`ga-disable-${measurementId}`]).toBe(false);
    expect(events("page_view")).toHaveLength(1);
  });

  it("저장소 전체 접근이 차단되어도 off를 현재 페이지에 적용한다", () => {
    browser.location = new URL("https://archive.example.test/y-brary/?analytics=off");
    const blocked = () => { throw new DOMException("Storage blocked", "SecurityError"); };
    browser.localStorage = { getItem: blocked, setItem: blocked, removeItem: blocked };
    const analytics = createAnalytics(options);
    analytics.pageView("/", "홈 | YBrary");
    analytics.pageView("/projects", "프로젝트 | YBrary");
    expect(commands()).toEqual([]);
    expect(browser[`ga-disable-${measurementId}`]).toBe(true);
  });

  it("저장소를 읽을 수 있어도 쓰기만 실패하면 명시적인 off 선택을 우선한다", () => {
    browser.location = new URL("https://archive.example.test/y-brary/?analytics=off");
    browser.localStorage.setItem = () => { throw new DOMException("Storage full", "QuotaExceededError"); };
    createAnalytics(options).pageView("/", "홈 | YBrary");
    expect(commands()).toEqual([]);
    expect(browser[`ga-disable-${measurementId}`]).toBe(true);
  });
});
