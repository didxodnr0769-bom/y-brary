import { projectSchema, reviewSchema } from "@/lib/content/schema";

export const projects = projectSchema.array().parse([
  {
    id: "project-color-picker-game",
    slug: "color-picker-game",
    title: "Color Picker Game",
    summary:
      "제시된 문제 색과 최대한 비슷한 색을 컬러 피커로 찾아 총 5문제 동안 자신의 색감을 테스트하는 웹 게임입니다.",
    description:
      "Color Picker Game은 제시된 문제 색을 보고 컬러 피커를 조작해 최대한 비슷한 색을 찾으며 자신의 색감을 테스트하는 웹사이트입니다.\n\n총 5문제로 구성되며 문제당 제한 시간은 10초입니다. 각 문제에서 목표 색과 사용자가 선택한 색의 유사도에 따라 점수를 부여합니다.\n\n테스트가 끝나면 전체 점수와 문제별 목표 색, 선택 색, 유사도 점수를 확인할 수 있습니다.",
    thumbnail: {
      url: "/content/projects/color-picker-game/cover.webp",
      alt: "Color Picker Game 로고와 눈으로 맞추는 다섯 개의 색 문구, 목표 색·컬러 휠·선택 색 카드가 배치된 시작 화면",
    },
    screenshots: [
      {
        id: "color-picker-game-picker",
        url: "/content/projects/color-picker-game/color-picker.webp",
        alt: "두 번째 문제의 목표 색과 내 선택 색을 비교하며 색상·채도·명도 슬라이더를 조절하는 컬러 피커 화면",
        caption: "제한 시간 안에 목표 색과 비슷한 색을 찾는 문제 화면",
        sortOrder: 0,
      },
      {
        id: "color-picker-game-result-summary",
        url: "/content/projects/color-picker-game/result-summary.webp",
        alt: "평균 유사도 점수와 총 소요 시간, 평균 응답 시간을 보여주는 Color Picker Game 결과 요약 화면",
        caption: "5문제의 평균 유사도와 응답 시간을 확인하는 결과 요약",
        sortOrder: 1,
      },
      {
        id: "color-picker-game-round-results",
        url: "/content/projects/color-picker-game/round-results.webp",
        alt: "다섯 문제의 목표 색과 선택 색, HEX 값, 유사도 점수, 응답 시간을 나열한 문제별 결과 화면",
        caption: "목표 색과 선택 색의 차이를 문제별로 비교하는 상세 결과",
        sortOrder: 2,
      },
    ],
    githubUrl: "https://github.com/didxodnr0769-bom/color-picker-game",
    liveUrl: "https://didxodnr0769-bom.github.io/color-picker-game/",
    tags: [],
    period: null,
    publishedAt: "2026-08-06",
    isSample: false,
  },
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
    summary: "사이드 프로젝트와 책, 강의 기록, 학습 정리를 한곳에 모으는 개인 아카이브입니다.",
    description:
      "YBrary는 완성한 프로젝트 결과와 책, 강의 기록, 학습 정리를 한곳에서 탐색할 수 있도록 만든 개인 아카이브입니다.\n\n프로젝트는 결과와 설명을 중심으로 소개하고, 책과 강의는 날짜·별점·짧은 후기·상세 기록으로 정리합니다. 학습 정리는 배운 개념과 실습 내용을 본문과 태그로 남깁니다.\n\n현재 콘텐츠는 저장소의 정적 데이터로 관리하며, 반응형 화면과 라이트·다크 테마를 지원합니다.",
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

export const reviews = reviewSchema.array().parse([
  {
    id: "book-the-sorrows-of-young-werther",
    kind: "book",
    category: "고전소설",
    slug: "the-sorrows-of-young-werther",
    title: "젊은 베르테르의 슬픔",
    creator: "요한 볼프강 폰 괴테",
    consumedOn: "2026-10-25",
    rating: 4,
    summary: "정열적인 사랑에는 공감했지만, 이미 약혼자가 있는 상대를 향한 구애와 자신을 파괴하는 선택은 끝내 이해하기 어려웠다.",
    body: "독서 정보\n요한 볼프강 폰 괴테 지음 · 하소연 옮김 · 자화상 미니북\n약 1개월 동안 읽고 2026년 10월 25일 완독. 별점 4.0 / 5.\n\n줄거리\n이야기는 주로 베르테르가 친구 빌헬름에게 보내는 편지를 통해 전개된다. 새로운 마을에 머물게 된 베르테르는 로테를 만나 사랑에 빠진다. 로테에게는 이미 약혼자가 있고, 이후 그와 결혼한다. 로테 역시 베르테르에게 호감을 느끼는 듯하지만 그의 사랑을 받아들이지는 않는다. 이루어질 수 없는 사랑에 괴로워하던 베르테르는 결국 스스로 생을 마감한다.\n\n감상\n누군가를 정열적으로 사랑하게 되는 마음 자체는 이해할 수 있었다. 하지만 이미 약혼자가 있는 로테에게 계속 사랑을 표현하고 구애하는 행동에는 공감하기 어려웠다. 사랑 때문에 젊은 나이에 자신의 삶을 끝내는 선택 역시 이해하기 힘들었다. 다만 그 시대에 나이를 바라보는 감각은 지금과 달랐을지도 모르겠다는 생각은 들었다.\n\n가장 인상 깊었던 장면은 로테를 거쳐 전달된 남편의 총을 받는 대목이다. 베르테르는 그것을 로테가 자신에게 죽음을 선물한 것처럼 받아들이며 기뻐한다. 내게는 사랑의 감정에 너무 깊이 빠져 현실을 제대로 바라보지 못하는 모습처럼 느껴졌다.\n\n살면서 누군가를 그만큼 정열적으로 사랑할 수 있을까 하는 의문도 들었다. 하지만 그 사랑이 비극적인 결말로 이어지는 모습을 보니, 차라리 평범한 사랑을 하는 편이 낫겠다는 생각이 남았다.\n\n전반적으로는 『위대한 개츠비』와 비슷한 느낌을 받았다. 책으로 읽지는 않았지만, 사랑을 위해 자신의 모든 것이 무너져 간다는 점이 겹쳐 보였다. 다만 시대와 주인공이 처한 환경이 달라 비슷하면서도 다른 이야기로 느껴졌다.\n\n표지 출처: 교보문고 도서 정보 · 자화상",
    publishedAt: "2026-10-26",
    cover: {
      url: "/content/books/the-sorrows-of-young-werther/cover.webp",
      alt: "자화상 출판, 하소연 옮김의 젊은 베르테르의 슬픔 미니북 표지. 짙은 녹색 바탕에 금색 테두리의 흑백 삽화와 제목이 배치되어 있다."
    },
    isSample: false
  },
]);
