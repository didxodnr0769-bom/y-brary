import { projectSchema, reviewSchema } from "@/lib/content/schema";

export const sampleProjects = projectSchema.array().parse([
  {
    id: "sample-project-ybrary",
    slug: "ybrary",
    title: "YBrary",
    summary: "사이드 프로젝트와 책·영화 기록을 한곳에서 살펴보는 개인 아카이브입니다.",
    description:
      "개인 기록으로 시작해 포트폴리오로 확장할 수 있도록 설계한 프로젝트입니다. 프로젝트 결과물은 간결하게 소개하고, 책과 영화는 감상일·별점·한 줄 감상·상세 기록으로 남깁니다.",
    thumbnail: {
      url: "/placeholders/project-ybrary.svg",
      alt: "YBrary 프로젝트 목록 화면을 상징하는 서가 형태의 샘플 이미지",
    },
    screenshots: [
      {
        id: "sample-ybrary-list",
        url: "/placeholders/screen-list.svg",
        alt: "YBrary 프로젝트 목록 화면 샘플",
        caption: "프로젝트 목록",
        sortOrder: 0,
      },
      {
        id: "sample-ybrary-detail",
        url: "/placeholders/screen-detail.svg",
        alt: "YBrary 프로젝트 상세 화면 샘플",
        caption: "프로젝트 상세",
        sortOrder: 1,
      },
      {
        id: "sample-ybrary-mobile",
        url: "/placeholders/screen-mobile.svg",
        alt: "YBrary 모바일 탐색 화면 샘플",
        caption: "모바일 메뉴",
        sortOrder: 2,
      },
    ],
    githubUrl: null,
    liveUrl: null,
    publishedAt: "2026-08-05",
    isSample: true,
  },
  {
    id: "sample-project-card",
    slug: "project-card-example",
    title: "프로젝트 카드 예시",
    summary: "썸네일과 프로젝트명, 한 줄 설명만으로 결과를 빠르게 탐색하는 카드 예시입니다.",
    description:
      "이 항목은 실제 개인 기록이 아닌 화면 검증용 샘플입니다. 실제 프로젝트가 등록되면 Codex가 승인된 내용과 이미지를 기준으로 교체합니다.",
    thumbnail: {
      url: "/placeholders/project-card.svg",
      alt: "프로젝트 카드 레이아웃 샘플 이미지",
    },
    screenshots: [
      {
        id: "sample-card-screen",
        url: "/placeholders/screen-detail.svg",
        alt: "프로젝트 카드 상세 화면 샘플",
        caption: "상세 화면 예시",
        sortOrder: 0,
      },
    ],
    githubUrl: null,
    liveUrl: null,
    publishedAt: "2026-08-04",
    isSample: true,
  },
]);

export const sampleReviews = reviewSchema.array().parse([
  {
    id: "sample-book-01",
    kind: "book",
    slug: "book-review-example-one",
    title: "책 기록 예시 01",
    creator: "저자명",
    consumedOn: "2026-08-03",
    rating: 4.5,
    summary: "책을 읽고 남길 한 줄 감상이 이 위치에 표시됩니다.",
    body:
      "이 기록은 실제 독서 기록이 아닌 화면 검증용 샘플입니다.\n\n상세 리뷰는 일반 텍스트로 최대 2,000자까지 저장하며, 문단 구분은 그대로 유지합니다.",
    cover: {
      url: "/placeholders/book-cover-one.svg",
      alt: "책 기록 예시 01의 샘플 표지",
    },
    publishedAt: "2026-08-03",
    isSample: true,
  },
  {
    id: "sample-book-02",
    kind: "book",
    slug: "book-review-example-two",
    title: "책 기록 예시 02",
    creator: "저자명",
    consumedOn: "2026-07-28",
    rating: 4,
    summary: "목록에서 제목과 감상일, 별점, 한 줄 감상을 빠르게 확인합니다.",
    body: "실제 책 정보를 등록하기 전 검색과 정렬, 상세 화면을 검증하기 위한 두 번째 샘플입니다.",
    cover: {
      url: "/placeholders/book-cover-two.svg",
      alt: "책 기록 예시 02의 샘플 표지",
    },
    publishedAt: "2026-07-28",
    isSample: true,
  },
  {
    id: "sample-film-01",
    kind: "film",
    slug: "film-review-example-one",
    title: "영화 기록 예시 01",
    creator: "감독명",
    consumedOn: "2026-08-02",
    rating: 4.5,
    summary: "영화를 보고 오래 남은 인상을 한 문장으로 정리하는 자리입니다.",
    body:
      "이 기록은 실제 영화 감상이 아닌 화면 검증용 샘플입니다.\n\n공개 포스터를 등록할 때는 이미지 이용 권리와 출처를 먼저 확인합니다.",
    cover: {
      url: "/placeholders/film-poster-one.svg",
      alt: "영화 기록 예시 01의 샘플 포스터",
    },
    publishedAt: "2026-08-02",
    isSample: true,
  },
  {
    id: "sample-film-02",
    kind: "film",
    slug: "film-review-example-two",
    title: "영화 기록 예시 02",
    creator: "감독명",
    consumedOn: "2026-07-25",
    rating: 3.5,
    summary: "두 번째 샘플은 제목 검색과 최신순 정렬을 확인하기 위해 존재합니다.",
    body: "실제 기록이 등록되면 이 샘플 데이터는 제거됩니다.",
    cover: {
      url: "/placeholders/film-poster-two.svg",
      alt: "영화 기록 예시 02의 샘플 포스터",
    },
    publishedAt: "2026-07-25",
    isSample: true,
  },
]);
