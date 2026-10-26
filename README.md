# YBrary

프로젝트, 책, 강의 기록과 학습 정리를 한곳에서 보여주는 개인 아카이브입니다. 방문자는 목록을 검색하고 최신순으로 탐색하며, 각 항목의 상세 기록을 읽을 수 있습니다.

현재 앱은 저장소의 정적 콘텐츠를 빌드에 포함합니다. 등록된 프로젝트와 책 기록은 유지하며, 강의 기록과 학습 정리는 빈 목록에서 시작합니다. 실제 사용자 기록을 확인하지 않은 샘플은 추가하지 않습니다.

## 기술 구성

- React 19, TypeScript, Vite 기반의 정적 SPA
- React Router의 브라우저 라우팅과 정적 호스트용 경로별 HTML 셸
- Tailwind CSS 4 기반의 반응형 라이트·다크 테마
- 정적 TypeScript 콘텐츠, Markdown 학습 정리와 Zod 검증
- 기존 Supabase Postgres, Storage, RLS 전환 준비물(현재 앱에서 미사용)
- Zod 콘텐츠 검증, Sharp 이미지 WebP 최적화
- Vitest, ESLint, TypeScript 검사

## 시작하기

Node.js 24 LTS와 pnpm 11을 사용합니다.

```bash
corepack enable
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3001`을 엽니다. 프로젝트·책·강의는 `src/lib/content/static-data.ts`, 학습 정리는 `content/notes/*.md`에서 관리합니다.

## 환경 변수

| 이름 | 용도 |
| --- | --- |
| `VITE_SITE_URL` | 사이트 메타데이터 기준 URL. 기본값 `http://localhost:3001` |
| `VITE_BASE_PATH` | 앱과 배포 자산의 기준 경로. 기본값 `/`, 저장소 Pages 예시 `/y-brary/` |
| `VITE_ENABLE_INDEXING` | `true`일 때만 검색 엔진 색인 허용 |
| `NEXT_PUBLIC_SUPABASE_URL` | 향후 Supabase 게시 스크립트가 사용할 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 향후 Supabase 연동에 사용할 공개 키 |
| `SUPABASE_SECRET_KEY` | 게시 스크립트 전용 비밀키. 클라이언트 코드에 사용 금지 |
| `SUPABASE_MEDIA_BUCKET` | 공개 이미지 버킷 이름. 기본값 `media` |

`VITE_*` 변수는 공개 빌드 설정이므로 비밀키를 넣지 않습니다. 현재 앱 런타임은 Supabase 환경 변수를 읽지 않습니다. 위 Supabase 변수는 기존 데이터베이스 전환 준비물과 원격 게시 도구를 위한 예약 설정입니다. 해당 도구의 기존 `book`/`film` 계약은 현재 앱의 강의 기록·학습 정리 계약으로 전환하지 않았습니다.

## 정적 콘텐츠 관리

프로젝트, 책, 강의 기록은 `src/lib/content/static-data.ts`에서, 학습 정리는 `content/notes/*.md`에서 관리합니다. 학습 정리 파일은 YAML frontmatter에 메타데이터를 두고 그 아래에 Markdown 본문을 작성합니다. 스키마에 맞지 않는 데이터는 빌드 전에 Zod 검증에서 실패합니다. 프로젝트·강의 이미지가 아직 없다면 임의 이미지로 채우지 않고 화면에 미첨부 안내를 표시합니다. 학습 정리는 이미지와 별점 없이 제목, 정리일, 요약, 본문, 태그로 구성합니다.

- `/`: 프로젝트 목록
- `/books`: 책 기록
- `/courses`: 강의 기록
- `/notes`: 학습 정리

각 목록에서 `/projects/:slug`, `/books/:slug`, `/courses/:slug`, `/notes/:slug`의 상세 기록으로 이동할 수 있습니다. 검색은 브라우저에서 처리합니다. 영화 목록과 상세 화면은 제공하지 않습니다.

## 주요 명령

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## 정적 배포

`pnpm build`는 `dist/`에 배포 파일을 생성합니다. 저장소의 하위 경로로 배포할 때는 빌드 기준 경로를 지정합니다.

```bash
VITE_BASE_PATH=/y-brary/ pnpm build
VITE_BASE_PATH=/y-brary/ pnpm preview
```

프로덕션 사이트 주소는 빌드 전에 `VITE_SITE_URL`로 설정합니다. 빌드는 목록과 등록된 상세 경로마다 `index.html` 셸을 복사하고 `404.html`을 생성합니다. GitHub Pages에서 유효한 상세 주소를 직접 열거나 새로고침해도 앱을 불러올 수 있습니다. 각 셸의 콘텐츠 본문은 브라우저의 React가 렌더링하며, 페이지별 본문 HTML을 미리 만드는 SSG나 검색 엔진용 프리렌더링은 구현하지 않습니다.

GitHub Pages 배포는 `.github/workflows/deploy-pages.yml`을 수동 실행합니다. 소스 반영만으로 배포되지는 않습니다. 워크플로는 Node.js 24와 pnpm 11로 의존성을 설치하고 린트·타입 검사·테스트·빌드 후 `dist/`만 게시합니다. 저장소 경로는 `/y-brary/`이며 검색 엔진 색인은 기본적으로 차단합니다. 실제 Pages 활성화와 원격 콘텐츠 변경은 대상과 정확한 미리보기를 확인하고 승인한 뒤 진행합니다.

## 기존 원격 게시 도구

아래 명령은 기존 Supabase 원격 게시 도구입니다. 현재 정적 앱 콘텐츠를 변경하지 않으며, 강의 기록·학습 정리는 지원하지 않습니다.

```bash
pnpm content:preview content/drafts/example.json
pnpm content:publish content/drafts/example.json --approved
```

원격 게시 명령은 게시할 정확한 콘텐츠의 미리보기와 사용자 승인을 마친 뒤에만 실행합니다. 원본 이미지를 WebP로 최적화해 Storage에 올리고, 서비스 역할만 실행할 수 있는 RPC로 콘텐츠를 반영합니다. 자세한 절차는 [콘텐츠 게시 가이드](docs/content-publishing.md)를 참고하세요.

## 기존 Supabase 로컬 개발 준비물

Docker가 실행 중인 환경에서 다음 순서로 로컬 스키마를 재현합니다.

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm exec supabase status
```

기존 스키마는 프로젝트와 책·영화 리뷰를 대상으로 하며 강의 기록·학습 정리는 포함하지 않습니다. 초기 마이그레이션은 공개된 콘텐츠의 `SELECT`만 `anon`과 `authenticated` 역할에 허용합니다. 테이블 쓰기와 게시 RPC는 `service_role` 전용이며, 공개 `media` 버킷도 클라이언트 업로드 정책을 만들지 않습니다.

원격 YBrary Supabase 프로젝트 생성과 마이그레이션 적용은 아직 자동으로 수행하지 않습니다. 비용·조직 선택이 필요한 외부 변경이므로 대상 프로젝트를 정한 뒤 별도로 연결해야 합니다.

## 서체 저작권

이 사이트에는 넥슨이 제공한 메이플스토리 서체가 적용되어 있습니다. `src/assets/fonts/maplestory-light.ttf`와 `src/assets/fonts/maplestory-bold.ttf`의 모든 권리는 ㈜넥슨코리아에 있습니다. 공식 사용 조건 및 지적 재산권 안내는 배포 파일에 함께 포함합니다.

- [포함된 서체 저작권 안내](public/notices/maplestory-font.txt)
- [메이플스토리 공식 서체 배포 페이지](https://maplestory.nexon.com/Media/Font)

## 문서

- [제품 명세](docs/product-spec.md)
- [콘텐츠 게시 가이드](docs/content-publishing.md)
