# Task: Implement Dashboard + Real-time Backend

## Tests cần pass
- API tests từ Quinn: dashboard, close, delete, QR, auth, migrate, vote (updated)

## Steps
1. Đọc `.openclaw/state.json` → lấy BE_PORT (3002)
2. Đọc types + tests từ Quinn để hiểu requirements
3. Implement BE — TỰ QUYẾT ĐỊNH cách tổ chức:
   - Database schema updates: users table, polls table (add status, allowMultiple, ownerId)
   - Auth: magic link (email sending mock hoặc real), JWT/session token generation + verification
   - Dashboard: GET /api/polls với filtering (status query param)
   - Close poll: POST /api/polls/:id/close (owner check)
   - Delete poll: DELETE /api/polls/:id (owner check)
   - QR code: GET /api/polls/:id/qr (generate QR code base64 data URL)
   - Migrate polls: POST /api/polls/migrate (transfer ownership from localStorage IDs to user)
   - Vote update: support optionIds array, check poll.status, allowMultiple logic
4. BẮT BUỘC: `npm run dev` PHẢI start server thành công
5. Run: npx vitest run [test-path]
6. Iterate đến khi ALL GREEN
7. Commit: git add -A && git commit -m "feat: implement dashboard-realtime backend"

## Rules
- TOÀN QUYỀN: folder structure, dependencies, database schema, auth implementation (mock email OK cho M2)
- TypeScript strict, no any
- Import shared types đã có
- KHÔNG sửa test files
- **REQUIRED:** Server PHẢI start được (`npm run dev` success)
- **Heartbeat mỗi 10 phút** trong Discord thread

## Spec

### API Contracts

**GET /api/polls**
- Query: `?status=active|closed|all` (default: "all")
- Headers: `Authorization: Bearer <token>` (optional)
- Response: `{ polls: DashboardPollItem[] }` (sorted newest first)
- Auth user: only their polls; anonymous: all polls

**GET /api/polls/:id/qr**
- Response: `{ pollId, shareUrl, qrCodeDataUrl }` (base64 PNG)
- Library: qrcode hoặc tương tự

**POST /api/polls/:id/close**
- Headers: `Authorization: Bearer <token>` (required if ownerId)
- Response: `{ success: true, poll: Poll }` với status = "closed"
- Errors: 403 FORBIDDEN (not owner), 404 POLL_NOT_FOUND

**DELETE /api/polls/:id**
- Headers: `Authorization: Bearer <token>` (required if ownerId)
- Response: `{ success: true }`
- Errors: 403 FORBIDDEN, 404 POLL_NOT_FOUND

**POST /api/polls/:id/vote** (UPDATED from M1)
- Request: `{ optionIds: string[] }`
- Validate: poll.status = "active" (reject if closed → 400 POLL_CLOSED)
- Validate: if poll.allowMultiple = false → optionIds.length must be 1
- Response: VoteResponse
- Errors: 400 POLL_CLOSED, 400 ALREADY_VOTED, 400 INVALID_OPTION

**POST /api/auth/send-magic-link**
- Request: `{ email: string }`
- Action: Generate magic link token (JWT), send email (mock console.log OK for M2)
- Response: `{ success: true, message: "Magic link sent to your email" }`
- Errors: 400 VALIDATION_ERROR (invalid email)

**POST /api/auth/verify-magic-link**
- Request: `{ token: string }`
- Action: Verify JWT, create user if not exists, return session token
- Response: `{ success: true, session: AuthSession, user: User }`
- Errors: 401 UNAUTHORIZED (invalid/expired token)

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Response: `{ user: User }`
- Errors: 401 UNAUTHORIZED

**POST /api/polls/migrate**
- Headers: `Authorization: Bearer <token>` (required)
- Request: `{ pollIds: string[] }`
- Action: Update polls.ownerId → authenticated user ID
- Response: `{ migrated: number }`
- Errors: 401 UNAUTHORIZED

### Database Schema Updates

**users table (new):**
- id (primary key, UUID)
- email (unique)
- createdAt (timestamp)

**polls table (updates):**
- Add: status ("active" | "closed", default "active")
- Add: allowMultiple (boolean, default false)
- Add: ownerId (foreign key to users.id, nullable)

### Implementation Notes
- **Auth tokens:** JWT với expiry 30 days
- **Magic link:** Token encodes userId + email, expires in 15 minutes
- **Email sending:** Mock (console.log) OK for M2 — real email defer to later
- **QR code:** Use `qrcode` npm package → generate base64 data URL
- **Owner check:** Compare request user ID (from token) với poll.ownerId
- **Anonymous polls:** ownerId = null → anyone can close/delete (by IP/token check from M1 logic)

### Test Priority
1. Auth flow: send → verify → me
2. Dashboard: list polls, filter by status
3. Close poll: owner-only, status update
4. Delete poll: owner-only, remove from DB
5. QR code: generate + return base64
6. Migrate: transfer ownership
7. Vote: closed poll reject, multiple choice logic
