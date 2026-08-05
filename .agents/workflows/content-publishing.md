# Content publishing workflow for agents

1. 사용자가 제공하거나 확인한 사실만 `content/drafts/*.json`에 반영한다.
2. 이미지 권리와 대체 텍스트가 불명확하면 게시를 멈추고 확인한다.
3. `pnpm content:preview <manifest>`를 실행하고 결과를 사용자에게 보여준다.
4. 그 정확한 내용에 대한 명시적 승인이 있을 때만 `pnpm content:publish <manifest> --approved`를 실행한다.
5. 게시 후 목록, 검색, 상세, 이미지 URL을 실제 환경에서 확인한다.
6. 교체 또는 삭제는 새 승인 대상이다. 참조되지 않는 Storage 객체도 자동 삭제하지 않는다.

`SUPABASE_SECRET_KEY`는 로컬 게시 프로세스에서만 읽는다. 값을 출력하거나 클라이언트 번들에 전달하지 않는다.
