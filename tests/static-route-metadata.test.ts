import { describe, expect, it } from "vitest";

import { renderRouteMetadata } from "../scripts/build-static-routes";

const shell = `<!doctype html><html><head>
  <title>YBrary</title>
  <meta name="description" content="기본 설명" />
  <meta property="og:title" content="YBrary" />
  <meta property="og:description" content="기본 설명" />
  <meta property="og:url" content="https://example.com/" />
  <meta property="og:image" content="https://example.com/preview.png" />
  <meta name="twitter:title" content="YBrary" />
  <meta name="twitter:description" content="기본 설명" />
  <link rel="canonical" href="https://example.com/" />
</head></html>`;

describe("정적 경로 공유 메타데이터", () => {
  it("제목과 설명을 안전하게 삽입하고 배포 경로가 포함된 URL을 사용한다", () => {
    const html = renderRouteMetadata(shell, {
      path: "notes/example", title: 'A & "B"', description: "<태그>와 '인용'",
    }, "https://example.com", "/y-brary/");

    expect(html).toContain("<title>A &amp; &quot;B&quot; | YBrary</title>");
    expect(html).toContain('<meta name="description" content="&lt;태그&gt;와 &#39;인용&#39;" />');
    expect(html).toContain('<meta property="og:title" content="A &amp; &quot;B&quot; | YBrary" />');
    expect(html).toContain('<meta property="og:description" content="&lt;태그&gt;와 &#39;인용&#39;" />');
    expect(html).toContain('<meta name="twitter:title" content="A &amp; &quot;B&quot; | YBrary" />');
    expect(html).toContain('<meta name="twitter:description" content="&lt;태그&gt;와 &#39;인용&#39;" />');
    expect(html).toContain('<meta property="og:url" content="https://example.com/y-brary/notes/example/" />');
    expect(html).toContain('<link rel="canonical" href="https://example.com/y-brary/notes/example/" />');
    expect(html).toContain('<meta property="og:image" content="https://example.com/preview.png" />');
  });

  it("기본 배포 경로에서도 올바른 URL을 만들고 누락된 필수 태그를 알린다", () => {
    const route = { path: "books", title: "책", description: "기본 설명" };
    expect(renderRouteMetadata(shell, route, "https://example.com", "/"))
      .toContain('<link rel="canonical" href="https://example.com/books/" />');
    expect(() => renderRouteMetadata(shell.replace(/<meta property="og:url"[^>]+>/, ""), route, "https://example.com", "/"))
      .toThrow("og:url");
  });
});
