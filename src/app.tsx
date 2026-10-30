import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";

import { AppShell } from "@/components/app-shell";
import { ReviewListPage } from "@/components/review-list-page";
import { analytics } from "@/lib/analytics";
import { getLearningNoteBySlug, getProjectBySlug, getReviewBySlug } from "@/lib/content/repository";
import { readSearchQuery } from "@/lib/content/search";
import { assetUrl } from "@/lib/urls";
import { LearningNotesPage } from "@/pages/notes";
import { NotFoundPage } from "@/pages/not-found";
import { ProjectsPage } from "@/pages/projects";
import { HomePage } from "@/pages/home";
import { ReviewDetailPage } from "@/pages/review-detail";

const ProjectDetailPage = lazy(() => import("@/pages/project-detail").then((module) => ({ default: module.ProjectDetailPage })));
const LearningNoteDetailPage = lazy(() => import("@/pages/note-detail").then((module) => ({ default: module.LearningNoteDetailPage })));

function DetailRoute({ kind }: { kind: "project" | "book" | "course" | "note" }) {
  const { slug = "" } = useParams();
  if (kind === "project") return <ProjectDetailPage slug={slug} />;
  if (kind === "note") return <LearningNoteDetailPage slug={slug} />;
  return <ReviewDetailPage kind={kind} slug={slug} />;
}

const titles: Record<string, string> = { "/": "홈", "/projects": "프로젝트", "/books": "책", "/courses": "강의 기록", "/notes": "노트" };

function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    const [, collection, slug] = path.split("/");
    const record = collection === "projects" ? getProjectBySlug(slug)
      : collection === "books" ? getReviewBySlug("book", slug)
      : collection === "courses" ? getReviewBySlug("course", slug)
      : collection === "notes" ? getLearningNoteBySlug(slug) : null;
    document.title = `${titles[path] ?? record?.title ?? "기록을 찾을 수 없음"} | YBrary`;
    const shareTitle = path === "/" ? "YBrary | 프로젝트와 배움의 기록" : document.title;
    const shareDescription = record?.summary ?? "프로젝트와 책, 강의 기록, 노트를 모은 개인 아카이브 YBrary입니다.";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", shareDescription);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = new URL(assetUrl(path === "/" ? path : `${path}/`), import.meta.env.VITE_SITE_URL || window.location.origin).href;
    if (!canonical.parentNode) document.head.append(canonical);
    for (const [selector, value] of [
      ['meta[property="og:title"]', shareTitle],
      ['meta[property="og:description"]', shareDescription],
      ['meta[property="og:url"]', canonical.href],
      ['meta[name="twitter:title"]', shareTitle],
      ['meta[name="twitter:description"]', shareDescription],
    ]) document.querySelector(selector)?.setAttribute("content", value);
    window.scrollTo(0, 0);
    analytics.pageView(path, document.title);
  }, [pathname]);
  return null;
}

export function App() {
  const { search } = useLocation();
  const query = readSearchQuery({ q: new URLSearchParams(search).get("q") ?? undefined });
  return (
    <AppShell>
      <PageMetadata />
      <Suspense fallback={<p role="status">기록을 불러오는 중입니다.</p>}>
      <Routes>
        <Route path="/" element={<HomePage query={query} />} />
        <Route path="/projects" element={<ProjectsPage query={query} />} />
        <Route path="/books" element={<ReviewListPage kind="book" query={query} />} />
        <Route path="/courses" element={<ReviewListPage kind="course" query={query} />} />
        <Route path="/notes" element={<LearningNotesPage query={query} />} />
        <Route path="/projects/:slug" element={<DetailRoute kind="project" />} />
        <Route path="/books/:slug" element={<DetailRoute kind="book" />} />
        <Route path="/courses/:slug" element={<DetailRoute kind="course" />} />
        <Route path="/notes/:slug" element={<DetailRoute kind="note" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AppShell>
  );
}
