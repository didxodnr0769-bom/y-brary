import { projectSchema, reviewSchema } from "@/lib/content/schema";

export const projects = projectSchema.array().parse([
  {
    id: "project-major-scale-lab",
    slug: "major-scale-lab",
    title: "Major Scale Lab",
    summary:
      "12개 메이저 조의 조 이름·조표·영문 구성음·피아노 건반 위치를 연결해 익히고, 오답 재도전과 풀이 결과를 확인하는 10문제 반응형 훈련 웹 앱입니다.",
    description:
      "Major Scale Lab은 12개 메이저 조를 대상으로 조 이름, 조표, 영문 구성음, 피아노 건반 위치를 서로 연결해 떠올리는 학습용 웹 앱입니다.\n\n5가지 문제 유형을 두 문제씩 배치하고 서로 다른 10개 조를 선택해 한 세션을 구성하며, 오답이 있으면 틀린 항목만 다시 풀 수 있습니다. 문제별 풀이시간을 측정하고 필요할 때 힌트를 제공하며, 풀이시간·오답 제출·힌트 사용을 반영해 100점 기준 점수를 계산합니다.\n\n세션 종료 후에는 총 풀이시간, 문제당 평균, 첫 시도 정답 수와 문제별 재시도 기록을 아코디언 형태로 확인할 수 있습니다. JavaScript ES Modules, HTML, 반응형 CSS, SVG 조표와 CSS 기반 피아노 건반으로 구현해 PC와 모바일을 지원합니다.",
    thumbnail: {
      url: "/content/projects/major-scale-lab/cover.png",
      alt: "10문제 세션의 문제 수, 유형 구성, 출제 대상 조를 안내하는 Major Scale Lab 데스크톱 시작 화면",
    },
    screenshots: [
      {
        id: "major-scale-question-desktop",
        url: "/content/projects/major-scale-lab/question-desktop.png",
        alt: "E Major의 영문 구성음을 샵과 플랫 버튼으로 선택하는 데스크톱 문제 화면",
        caption: "음별 변화표를 선택해 메이저 조의 영문 구성음을 완성하는 문제",
        sortOrder: 0,
      },
      {
        id: "major-scale-question-mobile",
        url: "/content/projects/major-scale-lab/question-mobile.png",
        alt: "E Major 영문 구성음 문제와 풀이시간, 힌트 및 정답 확인 버튼이 표시된 모바일 화면",
        caption: "작은 화면에서도 동일한 학습 흐름을 제공하는 모바일 문제 화면",
        sortOrder: 1,
      },
      {
        id: "major-scale-result-summary",
        url: "/content/projects/major-scale-lab/result-summary.png",
        alt: "47점과 총 풀이시간, 문제당 평균, 첫 시도 정답, 오답 제출 및 힌트 사용 기록을 보여주는 결과 화면",
        caption: "풀이시간과 재시도·힌트 기록을 반영한 세션 결과 요약",
        sortOrder: 2,
      },
      {
        id: "major-scale-result-list",
        url: "/content/projects/major-scale-lab/result-list.png",
        alt: "각 문제의 유형, 풀이시간, 첫 시도 정답 여부, 재시도 및 힌트 사용을 나열한 문제별 결과 화면",
        caption: "10문제의 풀이 기록을 확인하는 결과 아코디언 목록",
        sortOrder: 3,
      },
      {
        id: "major-scale-result-detail",
        url: "/content/projects/major-scale-lab/result-detail.png",
        alt: "높은음자리표 조표와 영문 구성음 문제의 정답 조, 조표, 스케일 정보를 펼쳐 본 상세 결과 화면",
        caption: "문제를 펼쳐 출제 내용과 정답 정보를 확인하는 상세 결과",
        sortOrder: 4,
      },
    ],
    githubUrl: "https://github.com/didxodnr0769-bom/major_scale",
    liveUrl: "https://didxodnr0769-bom.github.io/major_scale/",
    tags: ["화성학", "피아노", "음악"],
    period: {
      startedAt: "2026-08-05",
      endedAt: "2026-08-06",
    },
    publishedAt: "2026-08-06",
    isSample: false,
  },
  {
    id: "project-ybrary",
    slug: "ybrary",
    title: "YBrary",
    summary: "사이드 프로젝트와 책·영화 감상 기록을 한곳에 정리하는 개인 아카이브입니다.",
    description:
      "YBrary는 완성한 프로젝트 결과와 책·영화 감상 기록을 한곳에서 탐색할 수 있도록 만든 개인 아카이브입니다.\n\n프로젝트는 결과와 설명을 중심으로 소개하고, 책과 영화는 감상일·별점·한 줄 감상·상세 기록으로 정리합니다.\n\n현재 콘텐츠는 저장소의 정적 데이터로 관리하며, 반응형 화면과 라이트·다크 테마를 지원합니다.",
    thumbnail: null,
    screenshots: [],
    githubUrl: null,
    liveUrl: null,
    tags: ["포트폴리오", "와이브러리", "리뷰 사이트"],
    period: null,
    publishedAt: "2026-08-06",
    isSample: false,
  },
]);

export const reviews = reviewSchema.array().parse([]);
