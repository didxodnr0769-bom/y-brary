# YBrary

프로젝트, 책, 영화 기록을 한곳에서 보여주는 개인 아카이브입니다. 방문자는 목록을 제목으로 검색하고 최신순으로 탐색하며, 각 항목의 상세 기록을 읽을 수 있습니다.

현재 앱은 저장소의 정적 콘텐츠를 빌드에 포함합니다. 샘플 레코드는 사용하지 않으며, 첫 실제 프로젝트로 YBrary가 등록되어 있습니다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 기반의 반응형 라이트·다크 테마
- 정적 TypeScript 콘텐츠와 Zod 검증
- 향후 전환용 Supabase Postgres, Storage, RLS 준비물
- Zod 콘텐츠 검증, Sharp 이미지 WebP 최적화
- Vitest, ESLint, TypeScript 검사

## 시작하기

Node.js 24 LTS와 pnpm 11을 사용합니다.

```bash
corepack enable
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 콘텐츠는 `src/lib/content/static-data.ts`에서 관리합니다.

## 환경 변수

| 이름 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 메타데이터 기준 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | 향후 Supabase 게시 스크립트가 사용할 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 향후 Supabase 연동에 사용할 공개 키 |
| `SUPABASE_SECRET_KEY` | 게시 스크립트 전용 비밀키. 클라이언트 코드에 사용 금지 |
| `SUPABASE_MEDIA_BUCKET` | 공개 이미지 버킷 이름. 기본값 `media` |
| `ENABLE_INDEXING` | `true`일 때만 검색 엔진 색인 허용 |

현재 앱 런타임은 Supabase 환경 변수를 읽지 않습니다. 위 Supabase 변수는 향후 데이터베이스 전환 및 게시 도구를 위한 예약 설정입니다.

## 정적 콘텐츠 관리

프로젝트와 책·영화 기록은 `src/lib/content/static-data.ts`에서 관리합니다. 스키마에 맞지 않는 데이터는 빌드 전에 Zod 검증에서 실패합니다. 이미지가 아직 없다면 빈 값을 임의 이미지로 채우지 않고 화면에 미첨부 안내를 표시합니다.

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

## 향후 Supabase 로컬 개발

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
