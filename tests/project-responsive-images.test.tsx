// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectCard } from "@/components/project-card";
import { ProjectDetailPage } from "@/pages/project-detail";
import { getProjectBySlug } from "@/lib/content/repository";
import type { Project } from "@/lib/content/schema";

vi.mock("@/lib/content/repository", () => ({ getProjectBySlug: vi.fn() }));

const project: Project = {
  id: "responsive-project",
  slug: "responsive-project",
  title: "반응형 이미지 프로젝트",
  summary: "화면 크기별 프로젝트 이미지",
  description: "목록과 상세, 확대 화면에서 이미지를 살펴봅니다.",
  thumbnail: {
    url: "/overview-2880.webp",
    alt: "프로젝트 대표 화면",
    sources: [{ url: "/overview-640.webp", width: 640 }, { url: "/overview-2880.webp", width: 2880 }],
  },
  screenshots: [{
    id: "detail",
    url: "/detail-2880.webp",
    alt: "프로젝트 상세 화면",
    sources: [{ url: "/detail-640.webp", width: 640 }, { url: "/detail-2880.webp", width: 2880 }],
    sortOrder: 0,
  }],
  githubUrl: null,
  liveUrl: null,
  tags: [],
  period: null,
  publishedAt: "2026-10-30",
  isSample: true,
};

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/y-brary/");
  vi.mocked(getProjectBySlug).mockReturnValue(project);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1024);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(768);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute("open", ""); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute("open"); },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("프로젝트 반응형 이미지", () => {
  it("프로젝트 목록은 상세 원본과 작은 이미지 후보를 함께 전달한다", () => {
    render(<MemoryRouter><ProjectCard project={project} /></MemoryRouter>);

    const image = screen.getByRole("img", { name: "프로젝트 대표 화면" });
    expect(image.getAttribute("src")).toBe("/y-brary/overview-2880.webp");
    expect(image.getAttribute("srcset")).toBe("/y-brary/overview-640.webp 640w, /y-brary/overview-2880.webp 2880w");
  });

  it("상세 대표·스크린샷 후보가 확대 화면까지 유지된다", () => {
    render(<MemoryRouter><ProjectDetailPage slug={project.slug} /></MemoryRouter>);

    expect(screen.getByRole("img", { name: "프로젝트 대표 화면" }).getAttribute("srcset"))
      .toBe("/y-brary/overview-640.webp 640w, /y-brary/overview-2880.webp 2880w");
    expect(screen.getByRole("img", { name: "프로젝트 상세 화면" }).getAttribute("srcset"))
      .toBe("/y-brary/detail-640.webp 640w, /y-brary/detail-2880.webp 2880w");

    fireEvent.click(screen.getByRole("button", { name: "프로젝트 상세 화면 크게 보기" }));

    const dialogElement = screen.getByRole("dialog", { name: "프로젝트 이미지 전체 화면 보기" });
    expect(dialogElement.getAttribute("data-scale-down")).toBe("true");
    const dialog = within(dialogElement);
    const image = dialog.getByRole("img", { name: "프로젝트 상세 화면" });
    expect(image.getAttribute("srcset")).toBe("/y-brary/detail-640.webp 640w, /y-brary/detail-2880.webp 2880w");
    expect(image.getAttribute("sizes")).toBe("100vw");
  });
});
