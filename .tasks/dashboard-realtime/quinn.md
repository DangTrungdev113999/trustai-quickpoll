# Task: Viết types + tests cho Dashboard + Real-time

## Steps
1. git checkout develop && git checkout -b feature/dashboard-realtime
2. Đọc existing types từ M1: `./shared/types/*.ts`
3. Update existing types (Poll, VoteRequest, ErrorCode) theo M2 spec
4. Thêm new types cho M2 (User, AuthSession, Dashboard*, QRCodeData, ClosePollResponse, etc)
5. Viết unit tests (API tests + FE component tests):
   - API tests: dashboard, close poll, delete poll, QR code, auth (send/verify/me), migrate polls
   - FE tests: Dashboard page render, PollDetail page render, Auth flow render, Close/Delete modals render
6. Commit: git add -A && git commit -m "test: add types + tests for dashboard-realtime (all RED)"

## Spec

### Shared Types (M2 additions/changes)

```typescript
// ============ EXTENDED EXISTING TYPES (from M1) ============

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean // NEW: true = multiple choice, false = single choice
  status: "active" | "closed" // NEW: closed polls cannot accept votes
  ownerId?: string // NEW: user ID who created (undefined = anonymous)
  createdAt: string
}

export interface VoteRequest {
  optionIds: string[] // CHANGED: array (was optionId: string in M1)
}

export type ErrorCode = 
  | 'POLL_NOT_FOUND' 
  | 'ALREADY_VOTED' 
  | 'INVALID_OPTION' 
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR' // NEW
  | 'UNAUTHORIZED' // NEW
  | 'FORBIDDEN' // NEW
  | 'AUTH_REQUIRED' // NEW
  | 'POLL_CLOSED' // NEW

// ============ NEW TYPES FOR M2 ============

export interface User {
  id: string
  email: string
  createdAt: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

export interface DashboardPollItem {
  id: string
  question: string
  totalVotes: number
  status: "active" | "closed"
  createdAt: string
}

export interface DashboardResponse {
  polls: DashboardPollItem[]
}

export interface SendMagicLinkRequest {
  email: string
}

export interface SendMagicLinkResponse {
  success: boolean
  message: string
}

export interface VerifyMagicLinkRequest {
  token: string
}

export interface VerifyMagicLinkResponse {
  success: boolean
  session: AuthSession
  user: User
}

export interface MeResponse {
  user: User
}

export interface MigratePollsRequest {
  pollIds: string[]
}

export interface MigratePollsResponse {
  migrated: number
}

export interface QRCodeData {
  pollId: string
  shareUrl: string
  qrCodeDataUrl: string // base64 data URL
}

export interface ClosePollResponse {
  success: boolean
  poll: Poll
}
```

### API Contracts

**GET /api/polls**
- Query: `?status=active|closed|all` (default: "all")
- Headers: `Authorization: Bearer <token>` (optional)
- Response: DashboardResponse

**GET /api/polls/:id/qr**
- Response: QRCodeData

**POST /api/polls/:id/close**
- Headers: `Authorization: Bearer <token>` (required if ownerId)
- Response: ClosePollResponse | 403 FORBIDDEN | 404 POLL_NOT_FOUND

**DELETE /api/polls/:id**
- Headers: `Authorization: Bearer <token>` (required if ownerId)
- Response: { success: true } | 403 FORBIDDEN | 404 POLL_NOT_FOUND

**POST /api/polls/:id/vote** (UPDATED)
- Request: VoteRequest (optionIds array)
- Response: VoteResponse | 400 POLL_CLOSED | 400 ALREADY_VOTED

**POST /api/auth/send-magic-link**
- Request: SendMagicLinkRequest
- Response: SendMagicLinkResponse | 400 VALIDATION_ERROR

**POST /api/auth/verify-magic-link**
- Request: VerifyMagicLinkRequest
- Response: VerifyMagicLinkResponse | 401 UNAUTHORIZED

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Response: MeResponse | 401 UNAUTHORIZED

**POST /api/polls/migrate**
- Headers: `Authorization: Bearer <token>`
- Request: MigratePollsRequest
- Response: MigratePollsResponse | 401 UNAUTHORIZED

### Test Scenarios

**API Tests:**
1. GET /api/polls → returns list sorted newest first
2. GET /api/polls?status=active → filters active polls only
3. GET /api/polls?status=closed → filters closed polls only
4. GET /api/polls/:id/qr → returns QR code data URL
5. POST /api/polls/:id/close → owner closes poll → status = "closed"
6. POST /api/polls/:id/close → non-owner → 403
7. DELETE /api/polls/:id → owner deletes poll
8. DELETE /api/polls/:id → non-owner → 403
9. POST /api/polls/:id/vote with closed poll → 400 POLL_CLOSED
10. POST /api/polls/:id/vote with multiple optionIds (allowMultiple poll) → success
11. POST /api/polls/:id/vote with multiple optionIds (single-choice poll) → 400 INVALID_OPTION
12. POST /api/auth/send-magic-link → sends link
13. POST /api/auth/verify-magic-link → returns session + user
14. POST /api/auth/verify-magic-link with invalid token → 401
15. GET /api/auth/me with valid token → user data
16. GET /api/auth/me without token → 401
17. POST /api/polls/migrate → migrates polls to user

**FE Component Tests:**
1. Dashboard page renders list of polls
2. Dashboard page renders empty state when no polls
3. Dashboard page renders tabs (Tất cả / Đang mở / Đã đóng)
4. PollDetail page renders poll question + options + QR code
5. PollDetail page renders "Close poll" button (owner only)
6. PollDetail page renders "Delete poll" button (owner only)
7. PollDetail page renders "Đã đóng" badge when status = closed
8. Auth login page renders email input + submit button
9. Auth verify page renders loading state
10. Close poll modal renders title + actions
11. Delete poll modal renders title + actions
12. Migrate polls modal renders when localStorage polls exist

## Rules
- Chỉ viết types + tests. KHÔNG implement.
- Tests phải chạy được nhưng FAIL (RED).
- Tự quyết định vị trí file tests.
- **FE tests = CHỈ render tests.** Verify components render + key elements exist.
- **TUYỆT ĐỐI KHÔNG dùng vi.mock() trong FE tests.**
- FE test pattern: `render(<MemoryRouter><Component /></MemoryRouter>)` → `expect(screen.getByRole(...))`.
- **M2 build trên M1:** Đọc existing types, extend (không rewrite từ đầu).
