# Task: Implement Core Poll Flow Backend

## Tests cần pass
Tất cả API tests từ Quinn trong feature/core-poll-flow branch

## Steps
1. Đọc `.openclaw/state.json` → lấy BE_PORT (3002)
2. Đọc types + tests để hiểu requirements
3. Implement BE: routes, logic, database — TỰ QUYẾT ĐỊNH cách tổ chức
4. BẮT BUỘC: Tạo `src/index.ts` với `app.listen(PORT)` + thêm scripts dev/start vào package.json
5. Verify: `npm run dev` PHẢI start server thành công trên đúng port
6. Run: npx vitest run [test-path]
7. Iterate đến khi ALL GREEN
8. Commit: git add -A && git commit -m "feat: implement core-poll-flow backend"

## Rules
- TOÀN QUYỀN: folder structure, dependencies, patterns, database
- TypeScript strict, no any
- Import shared types đã có
- KHÔNG sửa test files
- **REQUIRED:** Server PHẢI start được. Không chấp nhận code mà `npm run dev` fail.
- **Heartbeat mỗi 10 phút** trong Discord thread

## Spec

**API Contracts:**

**POST /api/polls**
- Request: `CreatePollRequest`
- Response 201: `CreatePollResponse`
- Response 400: `ErrorResponse` (validation: question empty, options < 2 or > 5, duplicate options)

**GET /api/polls/:id**
- Response 200: `PollResults`
- Response 404: `ErrorResponse` (code: POLL_NOT_FOUND)
- Headers: checks IP + sends `X-Voter-Token` cookie để track đã vote

**POST /api/polls/:id/vote**
- Request: `VoteRequest`
- Response 200: `VoteResponse`
- Response 404: `ErrorResponse` (code: POLL_NOT_FOUND)
- Response 409: `ErrorResponse` (code: ALREADY_VOTED) — nếu IP đã vote hoặc localStorage/cookie match
- Response 400: `ErrorResponse` (code: INVALID_OPTION) — optionId không tồn tại

**Implementation Details:**
- X-Voter-Token cookie: Set lần đầu khi GET /api/polls/:id (nếu chưa có), format UUID v4
- Server track: `{pollId}-{voterToken}` hoặc `{pollId}-{ip}` → đã vote
- IP tracking: Priority `req.ip` (Express default) → fallback `X-Forwarded-For` (first IP)
- Percentage: Round to 1 decimal, 0 if totalVotes = 0
- Database: SQLite/Postgres/in-memory — tự quyết định
