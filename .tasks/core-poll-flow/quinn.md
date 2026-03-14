# Task: Viết types + tests cho Core Poll Flow

## Steps
1. git checkout develop && git checkout -b feature/core-poll-flow
2. Viết shared types (TypeScript interfaces) từ spec
3. Viết unit tests: API tests + component tests
4. Commit: git add -A && git commit -m "test: add types + tests for core-poll-flow (all RED)"

## Spec

**Shared Types:**
```typescript
interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string; // ISO 8601
}

interface PollOption {
  id: string;
  text: string;
}

interface PollResults {
  poll: Poll;
  votes: VoteCount[];
  totalVotes: number;
  hasVoted: boolean; // true nếu user đã vote
}

interface VoteCount {
  optionId: string;
  count: number;
  percentage: number; // 1 decimal, 0 if totalVotes = 0
}

interface CreatePollRequest {
  question: string;
  options: string[]; // 2-5 items
}

interface CreatePollResponse {
  pollId: string;
  shareUrl: string;
}

interface VoteRequest {
  optionId: string;
}

interface VoteResponse {
  success: boolean;
  results: PollResults;
}

interface ErrorResponse {
  error: string;
  code: 'POLL_NOT_FOUND' | 'ALREADY_VOTED' | 'INVALID_OPTION' | 'VALIDATION_ERROR';
}
```

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

**Test Scenarios:**

**Poll Creation:**
- Tạo poll hợp lệ (question + 2-5 options) → 201 với pollId + shareUrl
- Tạo poll thiếu question → 400 VALIDATION_ERROR
- Tạo poll với 1 option → 400 VALIDATION_ERROR
- Tạo poll với 6 options → 400 VALIDATION_ERROR
- Tạo poll với duplicate options → 400 VALIDATION_ERROR

**Poll Retrieval:**
- GET poll tồn tại → 200 với poll + results (vote counts = 0 ban đầu)
- GET poll không tồn tại → 404 POLL_NOT_FOUND
- GET poll sau khi vote → hasVoted = true

**Voting:**
- Vote lần đầu với optionId hợp lệ → 200 với updated results
- Vote lần 2 từ cùng IP → 409 ALREADY_VOTED
- Vote với optionId không tồn tại → 400 INVALID_OPTION
- Vote vào poll không tồn tại → 404 POLL_NOT_FOUND
- Verify vote count tăng sau mỗi vote thành công
- Verify percentage tính đúng (count/total * 100, 1 decimal)
- Edge case: totalVotes = 0 → all percentages = 0

**Anti-spam:**
- Same IP vote 2 lần → 409
- localStorage check (FE) → disable Submit nếu đã vote
- Cookie persistence → server nhớ voter đã vote

**Clarifications:**
- X-Voter-Token cookie: Set lần đầu khi GET /api/polls/:id (nếu chưa có), format UUID v4
- Server track: `{pollId}-{voterToken}` hoặc `{pollId}-{ip}` → đã vote
- IP tracking: Priority `req.ip` (Express default) → fallback `X-Forwarded-For` (first IP)
- Tests: mock `req.ip` directly hoặc inject header, verify "same source vote twice → 409"

## Rules
- Chỉ viết types + tests. KHÔNG implement.
- Tests phải chạy được nhưng FAIL (RED).
- Tự quyết định vị trí file tests.
- **FE tests = CHỈ render tests.** Verify components render + key elements exist.
- **TUYỆT ĐỐI KHÔNG dùng vi.mock() trong FE tests.** Không mock react-router-dom, useNavigate, fetch, etc.
- FE test pattern: `render(<MemoryRouter><Component /></MemoryRouter>)` → `expect(screen.getByRole(...))`.
