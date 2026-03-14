# quickpoll

## Project
- Description: QuickPoll - App tạo poll bình chọn nhanh
- GitHub: git@github.com:DangTrungdev113999/trustai-quickpoll.git
- Started: 2026-03-14

## Workflow — TDD + UX Spec
1. Marcus viết API spec + tag Mia viết UX spec
2. Quinn viết shared types (`shared/types/`) + tests (ALL RED)
3. Sam implement BE (`server/`) → tests GREEN
4. Kai implement FE (`client/`) theo UX spec → tests GREEN
5. Quinn verify ALL GREEN + E2E

## Structure
```
quickpoll/
  shared/types/    ← Source of truth cho types (FE + BE import)
  client/          ← FE (xem client/CLAUDE.md)
  server/          ← BE (xem server/CLAUDE.md)
  .tasks/          ← Task files cho agents
```

## Git
- 1 repo, 1 folder: ~/Desktop/TrustAI/quickpoll/
- Agents làm việc trong CÙNG folder, KHÔNG clone riêng
- Feature branches: `feature/[name]` từ `develop`
- Commit: `feat|fix|chore|test|docs: [mô tả ngắn]`

## Code Rules
- TypeScript strict mode, no `any`
- `shared/types/` là source of truth — FE + BE import từ đây
- Mọi logic phải có tests
- Comments/JSDoc in English
- printWidth: 120
