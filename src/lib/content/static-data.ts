import { projectSchema, reviewSchema } from "@/lib/content/schema";

export const projects = projectSchema.array().parse([
  {
    id: "project-worstcompare",
    slug: "worstcompare",
    title: "WorstCompare",
    summary: "두 폴더의 차이를 나란히 비교하고, 필요한 변경 블록만 골라 반영하는 macOS용 파일 비교 도구.",
    description: "WorstCompare는 프로젝트 원본과 수정본, 서로 다른 작업 폴더, 백업과 현재 파일을 나란히 비교하는 데스크톱 앱입니다. 폴더 트리에서 변경되거나 한쪽에만 있는 파일을 찾고, 파일 상세 화면에서 텍스트의 차이를 줄 단위로 확인할 수 있습니다.\n\n필요한 변경 블록만 선택해 왼쪽 또는 오른쪽에 적용한 뒤 저장할 수 있습니다. 파일·폴더의 양방향 복사와 삭제, 실행 취소·다시 실행, 변경 위치를 보여주는 미니맵도 제공합니다. 파일 비교와 변경 처리는 로컬에서 수행합니다.\n\n자주 비교하는 두 폴더의 경로와 제외 패턴은 이름 있는 프리셋으로 저장해 다시 불러올 수 있습니다. 다크·라이트 테마를 지원하며, 비교 기록과 설정은 앱 저장소에 보관합니다.\n\nElectron·React·TypeScript·Vite로 구현했으며, 현재 패키징 대상은 macOS 13 이상을 사용하는 Apple Silicon Mac입니다.\n\n이미지는 촬영용 가상 프로젝트로 준비한 실제 앱 화면이며, 개인 작업 경로나 실제 프로젝트 데이터는 포함하지 않습니다.",
    thumbnail: {
      url: "/content/projects/worstcompare/folder-comparison.webp",
      alt: "가상 쇼핑몰 프로젝트의 두 폴더를 나란히 비교하며 변경·추가·삭제된 파일을 보여주는 WorstCompare 화면"
    },
    screenshots: [
      {
        id: "worstcompare-file-diff",
        url: "/content/projects/worstcompare/file-diff.webp",
        alt: "가상 설정 파일의 줄 단위 차이와 변경 블록을 반대편에 적용하는 버튼을 보여주는 WorstCompare 화면",
        caption: "필요한 변경 블록을 선택해 반영하는 파일 상세 비교",
        sortOrder: 0
      },
      {
        id: "worstcompare-comparison-presets",
        url: "/content/projects/worstcompare/comparison-presets.webp",
        alt: "가상 문서 프로젝트의 왼쪽·오른쪽 폴더 경로와 제외 패턴을 프리셋으로 저장하는 WorstCompare 화면",
        caption: "비교 경로와 제외 패턴을 함께 저장하는 프리셋",
        sortOrder: 1
      }
    ],
    githubUrl: "https://github.com/didxodnr0769-bom/WorstCompare",
    liveUrl: null,
    tags: ["macOS", "Electron", "React", "TypeScript", "파일 비교", "개발 도구"],
    period: null,
    publishedAt: "2026-10-27",
    isSample: false
  },
  {
    id: "project-deskmate",
    slug: "deskmate",
    title: "DeskMate",
    summary: "소스를 내려받아 원하는 에이전트를 연결하고, 필요한 기능과 캐릭터를 직접 추가해 쓰는 macOS 데스크톱 동료.",
    description: "DeskMate는 소스를 내려받아 자신이 사용하는 에이전트를 연결하고, 필요한 기능과 캐릭터를 직접 추가해 쓰는 macOS 데스크톱 앱입니다. Codex·Claude 등 원하는 에이전트와 함께 소스를 수정하며 자신만의 데스크톱 동료로 만들어가는 것을 목표로 합니다.\n\n근무시간을 HP 막대로 표현해 출근시간에는 0%에서 시작하고, 퇴근시간이 가까워질수록 100%까지 차오르는 기능을 제공합니다. 날짜별 할 일, 예약·반복 알림과 캐릭터도 커스터마이징을 시작할 수 있는 기본 기능으로 제공합니다. 이를 바탕으로 자신의 작업 방식에 맞는 기능과 동작을 더하고, 대화 연결도 원하는 에이전트에 맞게 구성할 수 있습니다.\n\nElectron·React·TypeScript와 Canvas 2D로 구현했으며, 소스를 받아 직접 실행·빌드하는 프로젝트입니다.\n\n이미지는 예제 데이터로 촬영한 화면이며, 대화 화면은 모의 연결로 앱 명령 흐름을 보여줍니다.",
    thumbnail: {
      url: "/content/projects/deskmate/overview.webp",
      alt: "돌멩이 캐릭터의 근무시간 HP와 메모 알림, 날짜별 할 일 관리 화면을 함께 배치한 DeskMate 소개 이미지"
    },
    screenshots: [
      {
        id: "deskmate-companion",
        url: "/content/projects/deskmate/companion.webp",
        alt: "돌멩이 캐릭터 위에 근무시간 HP 61퍼센트와 물 마시고 잠깐 쉬기 메모 알림이 표시된 DeskMate 화면",
        caption: "근무시간 HP와 메모 알림을 보여주는 데스크톱 동료",
        sortOrder: 0
      },
      {
        id: "deskmate-memos",
        url: "/content/projects/deskmate/memos.webp",
        alt: "기획안 초안 정리와 물 마시고 잠깐 쉬기 등 예제 할 일과 완료 항목을 보여주는 DeskMate 메모 화면",
        caption: "날짜별 할 일과 예약 알림을 관리하는 화면",
        sortOrder: 1
      },
      {
        id: "deskmate-chat",
        url: "/content/projects/deskmate/chat.webp",
        alt: "오늘 할 일을 보여달라는 요청에 예제 메모 목록을 답하는 DeskMate 대화 화면. 모의 Codex CLI 연결로 촬영했다.",
        caption: "모의 연결로 확인하는 대화와 메모 조회 예시",
        sortOrder: 2
      },
      {
        id: "deskmate-settings",
        url: "/content/projects/deskmate/settings.webp",
        alt: "캐릭터의 자유 이동과 잠시 숨기기, 숨기기 및 다시 표시 단축키를 안내하는 DeskMate 설정 화면",
        caption: "캐릭터 이동과 표시 단축키 설정",
        sortOrder: 3
      }
    ],
    githubUrl: "https://github.com/didxodnr0769-bom/deskmate",
    liveUrl: null,
    tags: ["macOS", "Electron", "React", "TypeScript", "데스크톱 동료", "AI 커스터마이징"],
    period: null,
    publishedAt: "2026-10-26",
    isSample: false
  },
  {
    id: "project-svn-workspace",
    slug: "svn-workspace",
    title: "SVN Workspace",
    summary: "SVN 이력 조회와 변경 비교부터 선택 커밋까지 한곳에서 처리하는 macOS용 SVN 클라이언트.",
    description: "평소 SVN으로 복잡한 작업을 하기보다는 이력 조회, 업데이트, 변경 비교와 커밋 같은 기본 기능을 주로 사용했습니다. Windows에서는 필요한 기능을 무료 프로그램으로 이용할 수 있었지만, macOS에서 찾아본 도구들은 유료이거나 사용에 제약이 있었습니다. 간단한 기능만 편하게 사용하기 위해 직접 만들어 사용하고 있습니다.\n\nSVN Workspace는 체크아웃, 업데이트, 변경 비교, 커밋에 집중한 데스크톱 앱입니다. 커밋 이력과 파일별 텍스트 diff를 확인하고, 필요한 변경만 골라 커밋할 수 있습니다.\n\n삭제된 폴더는 함께 삭제될 하위 항목을 미리 확인할 수 있으며, 여러 프로젝트 전환과 표시 이름 변경, VS Code 연결도 지원합니다.\n\nElectron·React·TypeScript로 구현했으며 맥에 설치된 SVN CLI를 직접 사용합니다. 별도 앱 계정이나 중계 서버 없이 로컬 작업 폴더를 연결하거나 저장소를 체크아웃해 사용합니다.\n\n이미지는 예제 데이터로 촬영한 실제 앱 화면입니다.",
    thumbnail: {
      url: "/content/projects/svn-workspace/history.webp",
      alt: "예제 프로젝트의 커밋 목록과 선택한 파일의 변경 내용을 나란히 보여주는 SVN Workspace 이력 화면"
    },
    screenshots: [
      {
        id: "svn-workspace-selective-commit",
        url: "/content/projects/svn-workspace/selective-commit.webp",
        alt: "예제 저장소의 수정 파일과 새 파일을 선택하고 커밋 메시지를 작성하는 SVN Workspace 화면",
        caption: "필요한 변경만 골라 커밋하는 화면",
        sortOrder: 0
      },
      {
        id: "svn-workspace-folder-deletion",
        url: "/content/projects/svn-workspace/folder-deletion.webp",
        alt: "삭제할 예제 폴더의 하위 파일 목록과 삭제 범위를 확인하는 SVN Workspace 화면",
        caption: "삭제 폴더의 하위 항목과 내용을 확인하는 화면",
        sortOrder: 1
      },
      {
        id: "svn-workspace-checkout",
        url: "/content/projects/svn-workspace/checkout.webp",
        alt: "예제 SVN 저장소 URL과 저장할 로컬 폴더를 입력하는 SVN Workspace 체크아웃 화면",
        caption: "새 저장소를 체크아웃하는 화면",
        sortOrder: 2
      },
      {
        id: "svn-workspace-project-management",
        url: "/content/projects/svn-workspace/project-management.webp",
        alt: "실제 파일과 로그인 정보를 유지하며 예제 프로젝트의 목록 등록만 제거하는 확인 화면",
        caption: "프로젝트 목록 등록을 관리하는 화면",
        sortOrder: 3
      }
    ],
    githubUrl: "https://github.com/didxodnr0769-bom/svn-workspace",
    liveUrl: null,
    tags: [
      "SVN",
      "macOS",
      "Electron",
      "React",
      "TypeScript",
      "개발 도구"
    ],
    period: null,
    publishedAt: "2026-10-26",
    isSample: false
  },
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
    startedOn: "2026-09-25",
    readingSource: "직접 소장",
    slug: "the-sorrows-of-young-werther",
    title: "젊은 베르테르의 슬픔",
    creator: "요한 볼프강 폰 괴테",
    consumedOn: "2026-10-25",
    rating: 4,
    summary: "정열적인 사랑에는 공감했지만, 이미 약혼자가 있는 상대를 향한 구애와 자신을 파괴하는 선택은 끝내 이해하기 어려웠다.",
    body: "독서 정보\n요한 볼프강 폰 괴테 지음 · 하소연 옮김 · 자화상 미니북\n직접 소장한 책으로, 2026년 9월 25일부터 10월 25일까지 읽었다. 별점 4 / 5.\n\n줄거리\n이야기는 주로 베르테르가 친구 빌헬름에게 보내는 편지를 통해 전개된다. 새로운 마을에 머물게 된 베르테르는 로테를 만나 사랑에 빠진다. 로테에게는 이미 약혼자가 있고, 이후 그와 결혼한다. 로테 역시 베르테르에게 호감을 느끼는 듯하지만 그의 사랑을 받아들이지는 않는다. 이루어질 수 없는 사랑에 괴로워하던 베르테르는 결국 스스로 생을 마감한다.\n\n감상\n누군가를 정열적으로 사랑하게 되는 마음 자체는 이해할 수 있었다. 하지만 이미 약혼자가 있는 로테에게 계속 사랑을 표현하고 구애하는 행동에는 공감하기 어려웠다. 사랑 때문에 젊은 나이에 자신의 삶을 끝내는 선택 역시 이해하기 힘들었다. 다만 그 시대에 나이를 바라보는 감각은 지금과 달랐을지도 모르겠다는 생각은 들었다.\n\n가장 인상 깊었던 장면은 로테를 거쳐 전달된 남편의 총을 받는 대목이다. 베르테르는 그것을 로테가 자신에게 죽음을 선물한 것처럼 받아들이며 기뻐한다. 내게는 사랑의 감정에 너무 깊이 빠져 현실을 제대로 바라보지 못하는 모습처럼 느껴졌다.\n\n살면서 누군가를 그만큼 정열적으로 사랑할 수 있을까 하는 의문도 들었다. 하지만 그 사랑이 비극적인 결말로 이어지는 모습을 보니, 차라리 평범한 사랑을 하는 편이 낫겠다는 생각이 남았다.\n\n전반적으로는 『위대한 개츠비』와 비슷한 느낌을 받았다. 책으로 읽지는 않았지만, 사랑을 위해 자신의 모든 것이 무너져 간다는 점이 겹쳐 보였다. 다만 시대와 주인공이 처한 환경이 달라 비슷하면서도 다른 이야기로 느껴졌다.\n\n표지 출처: 교보문고 도서 정보 · 자화상",
    publishedAt: "2026-10-26",
    cover: {
      url: "/content/books/the-sorrows-of-young-werther/cover.webp",
      alt: "자화상 출판, 하소연 옮김의 젊은 베르테르의 슬픔 미니북 표지. 짙은 녹색 바탕에 금색 테두리의 흑백 삽화와 제목이 배치되어 있다."
    },
    isSample: false
  },
  {
    id: "book-project-hail-mary",
    kind: "book",
    slug: "project-hail-mary",
    title: "프로젝트 헤일메리",
    creator: "앤디 위어",
    category: "SF",
    startedOn: null,
    readingSource: "리디북스",
    consumedOn: "2026-06-12",
    rating: 5,
    summary: "기억을 잃고 우주에 떠도는 지구인의 생존기.",
    body: "독서 경로\n어버이날 아빠에게 『프로젝트 헤일메리』를 선물하면서, 안 읽으실까 봐 나중에 퀴즈를 내겠다고 했다. 그런데 퀴즈를 내려면 나도 내용을 알아야 해서 리디북스에서 구매해 읽어보았다.\n\n주요 내용\n기억을 잃은 채 우주선에서 깨어난 라일랜드 그레이스는 태양의 에너지를 빼앗는 미생물 아스트로파지로부터 지구를 구하기 위해 타우 세티로 보내졌음을 알아간다. 그곳에서 같은 위기를 해결하려는 외계인 로키를 만나 언어와 환경의 차이를 넘어 친구가 되고, 함께 해결책인 타우메바를 찾아낸다.\n\n연구 결과를 지구로 보낸 그레이스는 귀환길에 로키가 위험에 빠졌음을 깨닫고, 지구로 돌아가는 대신 친구를 구하러 간다. 이후 로키의 고향에서 아이들을 가르치며 살아가고, 지구의 태양이 회복됐다는 소식으로 자신의 임무가 성공했음을 확인한다.\n\n감상평\n홀리듯이 읽어버렸다. 오랜만에 책에 깊이 집중했고, 지루한 부분은 거의 없었던 것 같다. 초반에는 기억을 잃은 그레이스가 자신과 임무에 관한 기억을 되찾는 과정이 흥미로웠고, 로키를 만난 뒤부터는 시간 가는 줄 모르고 읽었다.\n\n가장 흥미로웠던 것은 지능을 가진 전혀 다른 존재와 어떻게 의사소통할 수 있을지를 풀어가는 과정이다. 숫자 체계부터 서로 이해할 수 있는 내용을 하나씩 늘려가고, 마침내 번역 프로그램을 작성해 번역기를 만드는 모습이 프로그래머의 입장에서 특히 재미있었다. 이 과정이 영화에서는 많이 생략되어 아쉬웠다.\n\n인상 깊었던 장면\n가장 뭉클했던 장면은 각자의 행성을 구할 방법을 찾은 두 사람이 고향으로 돌아가기 위해 이별하는 순간이었다. 다른 이별보다 슬펐던 이유는 두 사람이 다시 만나지 못하리라는 사실을 서로 확실히 알고 있었기 때문이다. 그런데도 문제가 생기자 그레이스가 지구로 돌아갈 기회를 포기하고 로키를 구하러 가는 모습을 보며, 종족을 초월한 우정이라는 말이 떠올랐다.\n\n그레이스가 돌아갈 연료가 없어 어차피 곧 죽을 것이라고 무덤덤하게 말하자, 로키가 자신의 연료를 나눠줄 수 있다고 하는 장면도 인상 깊었다. 그레이스에게는 바꿀 수 없는 운명처럼 보였던 문제가 로키에게는 집에 조금 늦게 돌아가면 되는 일이었다. 친구에게 나눠줄 만큼 충분한 연료를 가진 로키의 제안이 뭉클하게 다가왔다.\n\n표지 출처: 교보문고 · 알에이치코리아(RHK)",
    publishedAt: "2026-10-26",
    cover: {
      url: "/content/books/project-hail-mary/cover.webp",
      alt: "앤디 위어의 프로젝트 헤일메리 한국어판 표지. 파란 우주에 주황색 태양과 행성들이 있고, 하단에는 영화 원작 안내 띠가 배치되어 있다."
    },
    isSample: false
  },
  {
    id: "book-the-martian",
    kind: "book",
    slug: "the-martian",
    title: "마션",
    creator: "앤디 위어",
    category: "SF",
    startedOn: null,
    readingSource: "리디북스",
    consumedOn: "2026-10-23",
    rating: 3,
    summary: "치밀한 문제 해결 과정은 좋았지만, 낯선 과학 용어와 예상 가능한 결말 때문에 『프로젝트 헤일메리』만큼 몰입하지는 못했다.",
    body: "독서 경로\n『프로젝트 헤일메리』를 재미있게 읽은 뒤, 같은 작가의 작품이자 영화로도 성공한 『마션』을 읽었다. 출간 순서로는 『마션』이 먼저지만, 나중에 나온 작품을 먼저 즐긴 뒤 이전 작품을 찾아 읽은 셈이다. 리디북스에서 읽었다.\n\n줄거리\n화성을 탐사하던 우주인 마크 와트니는 거센 폭풍으로 동료들과 철수하던 중 사고를 당해 홀로 낙오된다. 화성에 남겨진 그가 제한된 자원과 과학 지식을 활용해 생존해 나가는 이야기다.\n\n감상평\n『프로젝트 헤일메리』에 비하면 내게는 꽤 느슨하게 읽혔다. 흥미를 크게 느끼지 못하다 보니 자주 손이 가지 않았고, 다 읽기까지도 오랜 시간이 걸렸다. 생존을 위해 문제를 해결해 나간다는 큰 틀은 비슷하지만, 실제 탐사 대상인 화성을 배경으로 하고 외계인과의 만남도 없다는 점에서 조금 더 현실에 있을 법한 이야기라 오히려 덜 흥미로웠던 것 같기도 하다.\n\n내가 화성에 표류하더라도 이 책만 있다면 어떻게든 살아갈 수 있지 않을까 싶을 정도로 설명이 자세하다. 통신과 관련해서는 나사가 알려주는 대로 주인공도 따라가는 부분이 있지만, 식물을 기르거나 로버를 수리하는 장면에서는 모르는 용어가 계속 나와 조금 지루했다.\n\n우주에 관한 지식을 조금 더 쌓은 뒤 읽었으면 어땠을까 하는 생각도 들었다. 영화는 화면으로 어떤 작업을 하는지 볼 수 있지만, 책에서는 낯선 용어로 설명되는 행동 자체를 상상하기 어려워 읽기가 버거웠다.\n\n『프로젝트 헤일메리』에서는 주인공이 로키와 어떻게 관계를 맺고, 과연 지구로 돌아올 수 있을지가 궁금했다. 반면 『마션』은 어찌 되었든 귀환에 성공할 것처럼 느껴져 결과가 어느 정도 예상됐고, 그만큼 다음 전개에 대한 기대도 크지 않았다.\n\n좋았던 점\n그럼에도 앤디 위어의 세세한 묘사와 문제 해결 과정은 마음에 들었다. 실제로 얼마나 과학적으로 정확한지는 모르지만, 문제가 생겼을 때 원인을 짚고 해결책을 세운 뒤 필요한 조건을 찾아가는 주인공의 논리적인 사고가 좋았다.\n\n감정에 기대기보다 주어진 상황에서 최적의 답을 찾아가는 느낌이었다. 『프로젝트 헤일메리』에서도 좋았던 부분이고, 나도 이런 사고방식을 배우고 싶다는 생각이 들었다.\n\n다음에 읽을 책\n앤디 위어의 우주 3부작으로 불리는 작품 중 『아르테미스』가 남았다. 이 책은 차차 구매해 읽어볼 생각이다.\n\n표지 출처: 리디 · 알에이치코리아(RHK)",
    publishedAt: "2026-10-26",
    cover: {
      url: "/content/books/the-martian/cover.webp",
      alt: "앤디 위어의 마션 한국어판 표지. 보라색과 주황색의 화성 풍경에 우주인과 로버, 식물이 그려져 있다."
    },
    isSample: false
  },
]);
