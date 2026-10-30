# YBrary

프로젝트와 책, 강의 기록, 노트를 한곳에 모은 개인 아카이브입니다. 만들고 경험한 것과 배운 내용을 기록하고, 주제별 연결을 따라 탐색할 수 있습니다.

## 화면 미리보기

### 그래프 홈

![중앙의 나와 프로젝트, 책, 강의 기록, 노트를 별자리처럼 연결한 그래프 홈](docs/screenshots/home.jpg)

### 프로젝트 목록

![프로젝트 검색창과 태그 필터, 프로젝트 카드가 표시된 목록 화면](docs/screenshots/projects.jpg)

### 노트 목록

![노트 검색창과 제목, 요약, 태그가 표시된 목록 화면](docs/screenshots/notes.jpg)

## 주요 기능

- **그래프 홈**: 중앙의 ‘나’를 중심으로 프로젝트·책·강의·노트와 실제 태그 및 카테고리의 연결을 보여줍니다. 분류나 주제를 선택해 관련 기록을 살펴보고 상세 화면으로 이동할 수 있습니다. 드래그, 확대·축소, 키보드와 터치 조작을 지원합니다.
- **프로젝트**: 프로젝트 소개와 태그, 진행 기간, 이미지, GitHub 및 서비스 링크를 기록합니다. 제목·태그 검색과 태그 필터를 제공합니다.
- **책**: 독서 기간과 읽은 곳, 별점과 감상을 기록합니다. 제목·저자 검색과 카테고리 필터로 책을 찾을 수 있습니다.
- **강의 기록**: 강사와 플랫폼, 수강일, 별점과 후기를 기록하고 제목으로 검색합니다.
- **노트**: 배운 내용과 개인적인 생각을 Markdown으로 정리하고 제목·태그로 검색합니다.
- **반응형 화면과 테마**: 모바일 메뉴와 라이트·다크 테마를 지원합니다. 그래프 홈은 어두운 배경으로 표시합니다.

각 기록의 상세 본문은 Markdown으로 작성하며 표, 체크리스트, 코드 블록 등을 지원합니다. 프로젝트 이미지와 책 표지는 상세 화면에서 크게 볼 수 있습니다.

## 기술 구성

- React 19, TypeScript, Vite 기반 정적 SPA
- React Router, Tailwind CSS 4
- 정적 TypeScript 데이터와 Markdown, Zod 콘텐츠 검증
- Vitest, ESLint, TypeScript

## 시작하기

Node.js 24와 pnpm 11을 사용합니다.

```bash
corepack enable
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3001`을 엽니다.

## 콘텐츠 관리

- 프로젝트·책·강의 기록: `src/lib/content/static-data.ts`
- 노트: `content/notes/*.md`의 YAML frontmatter와 Markdown 본문
- 이미지: `public/` 아래의 정적 자산

콘텐츠는 빌드에 포함되며 Zod 스키마로 검증합니다. 상세 본문에 Markdown을 사용할 수 있고 HTML 태그는 표시하지 않습니다. 이미지에는 대체 텍스트를 작성하며 공개 전에 사용 권한을 확인합니다. 콘텐츠 항목과 화면 구성의 자세한 기준은 [제품 명세](docs/product-spec.md)를 참고하세요.

## 주요 명령

```bash
pnpm lint       # 린트
pnpm typecheck  # 타입 검사
pnpm test       # 테스트
pnpm build      # 정적 사이트 빌드
pnpm preview    # 빌드 결과 미리보기
```

## 빌드와 배포

`pnpm build`는 `dist/`에 정적 파일을 생성합니다. 목록과 등록된 상세 경로에 HTML 셸을 생성해 직접 접근과 새로고침을 지원합니다. 상세 본문은 브라우저에서 렌더링됩니다.

| 환경 변수 | 용도 | 기본값 |
| --- | --- | --- |
| `VITE_SITE_URL` | 메타데이터와 공유 링크의 기준 URL | `http://localhost:3001` |
| `VITE_BASE_PATH` | 앱과 자산의 기준 경로 | `/` |
| `VITE_ENABLE_INDEXING` | `true`일 때 검색 엔진 색인 허용 | `false` |

GitHub Pages 워크플로는 `main`에 push하거나 수동 실행하면 린트·타입 검사·테스트 후 사이트를 빌드하고 배포합니다. 워크플로의 기준 경로는 `/y-brary/`입니다.

## 서체 저작권

이 사이트에는 넥슨이 제공한 메이플스토리 서체가 적용되어 있습니다. 서체의 모든 권리는 ㈜넥슨코리아에 있습니다.

- [포함된 서체 저작권 안내](public/notices/maplestory-font.txt)
- [메이플스토리 공식 서체 배포 페이지](https://maplestory.nexon.com/Media/Font)
