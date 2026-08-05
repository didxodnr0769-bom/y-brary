<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## YBrary project rules

- Treat `docs/product-spec.md` as the product and content contract.
- Read `.agents/README.md` before changing content or publication tooling.
- Never publish, edit, or delete remote content without showing a preview and receiving explicit user approval for that exact content.
- Never expose `SUPABASE_SECRET_KEY` to browser code, logs, committed files, or `NEXT_PUBLIC_*` variables.
- Keep sample records visibly marked as samples. Do not infer personal projects, ratings, dates, or review text.
- Verify image usage rights and alt text before publishing a cover, poster, or screenshot.
