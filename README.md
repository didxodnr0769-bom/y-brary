# YBrary

프로젝트, 책, 영화 기록을 한곳에서 보여주는 개인 아카이브입니다. 방문자는 목록을 제목으로 검색하고 최신순으로 탐색하며, 각 항목의 상세 기록을 읽을 수 있습니다.

현재 저장소는 로컬에서 바로 확인할 수 있도록 명시적인 샘플 데이터를 사용합니다. Supabase 환경 변수가 모두 설정되면 같은 화면이 공개된 데이터만 조회합니다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 기반의 반응형 라이트·다크 테마
- Supabase Postgres, Storage, RLS
- Zod 콘텐츠 검증, Sharp 이미지 WebP 최적화
- Vitest, ESLint, TypeScript 검사

## 시작하기

Node.js 24 LTS와 pnpm 11을 사용합니다.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Supabase 값을 비워 두면 `src/lib/content/mock-data.ts`의 `Sample` 레코드가 표시됩니다.

## 환경 변수

| 이름 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 메타데이터 기준 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 데이터 조회와 게시 스크립트가 사용할 Supabase URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 브라우저에 노출 가능한 공개 조회 키 |
| `SUPABASE_SECRET_KEY` | 게시 스크립트 전용 비밀키. 클라이언트 코드에 사용 금지 |
| `SUPABASE_MEDIA_BUCKET` | 공개 이미지 버킷 이름. 기본값 `media` |
| `ENABLE_INDEXING` | `true`일 때만 검색 엔진 색인 허용 |

`NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 둘 다 설정하거나 둘 다 비워야 합니다.

## 주요 명령

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build

pnpm content:preview content/drafts/example.json
pnpm content:publish content/drafts/example.json --approved
```

게시 명령은 미리보기와 사용자 승인을 마친 뒤에만 실행합니다. 원본 이미지를 WebP로 최적화해 Storage에 올리고, 서비스 역할만 실행할 수 있는 RPC로 콘텐츠를 반영합니다. 자세한 절차는 [콘텐츠 게시 가이드](docs/content-publishing.md)를 참고하세요.

## Supabase 로컬 개발

Docker가 실행 중인 환경에서 다음 순서로 로컬 스키마를 재현합니다.

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm exec supabase status
```

초기 마이그레이션은 공개된 콘텐츠의 `SELECT`만 `anon`과 `authenticated` 역할에 허용합니다. 테이블 쓰기와 게시 RPC는 `service_role` 전용이며, 공개 `media` 버킷도 클라이언트 업로드 정책을 만들지 않습니다.

원격 YBrary Supabase 프로젝트 생성과 마이그레이션 적용은 아직 자동으로 수행하지 않습니다. 비용·조직 선택이 필요한 외부 변경이므로 대상 프로젝트를 정한 뒤 별도로 연결해야 합니다.

## 문서

- [제품 명세](docs/product-spec.md)
- [콘텐츠 게시 가이드](docs/content-publishing.md)
