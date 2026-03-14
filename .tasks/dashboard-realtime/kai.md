# Task: Implement Dashboard + Real-time Frontend

## Tests cần pass
- FE component tests từ Quinn: Dashboard, PollDetail, Auth, modals render tests

## UX Spec
[COPY TOÀN BỘ UX spec từ Mia — bao gồm Dashboard tabs, PollDetail QR code, Close/Delete modals, Auth flow, Migrate modal, Realtime polling (3s), Multiple choice UI, Error patterns, Loading patterns]

**Dashboard Page:**
- Tabs: "Tất cả" | "Đang mở" | "Đã đóng" (filter by status)
- Default tab: "Tất cả"
- Tab state persist trong URL: `/dashboard?tab=active`
- Closed polls: badge "Đã đóng" (gray, top-right)
- Empty state: icon + "Chưa có poll nào" + button "Tạo poll mới"
- Loading: skeleton cards (3 placeholders)
- Click poll card → navigate `/polls/:id`
- Click "Delete" icon → modal confirm → DELETE → toast → remove from list

**Poll Detail Page:**
- Hiển thị: question + options + bar chart + QR code + share URL
- QR code: base64 image, download button
- Real-time polling: poll GET /api/polls/:id every 3s, smooth bar animation (0.3s ease)
- Owner-only buttons:
  - "Close poll" button (chỉ khi status = "active")
  - "Delete poll" button
- Badge "Đã đóng" khi status = "closed"
- Closed poll: vote form disable + tooltip "Poll đã đóng"
- Mobile: QR code below results (200x200px)
- Desktop: QR code bên phải (300x300px), sticky khi scroll

**Close Poll Modal:**
- Title: "Đóng poll này?"
- Body: "Poll sẽ không nhận vote mới. Bạn vẫn có thể xem kết quả và xóa poll sau."
- Actions: "Đóng poll" (primary) | "Hủy" (ghost)
- Click "Đóng poll" → POST /api/polls/:id/close → toast "Đã đóng poll" → update UI

**Delete Poll Modal:**
- Title: "Xóa poll này?"
- Body: "{question}" — action này không thể hoàn tác
- Actions: "Xóa" (destructive red) | "Hủy" (ghost)
- Click "Xóa" → DELETE /api/polls/:id → toast "Đã xóa poll" → remove from UI

**Auth Flow:**
- Login page (`/login`): email input + button "Gửi magic link"
- Success: message "Magic link đã gửi đến {email}. Kiểm tra hộp thư."
- Verify page (`/auth/verify?token=xxx`): loading spinner → POST /api/auth/verify-magic-link → redirect `/dashboard`
- Error: "Link không hợp lệ hoặc hết hạn" + button "Về trang chủ"

**Migrate Polls Modal:**
- Trigger: sau login, nếu localStorage có polls → hiện modal
- Title: "Migrate polls của bạn?"
- Body: "Bạn có {count} polls chưa đăng nhập. Migrate để quản lý tập trung?"
- Actions: "Migrate" (primary) | "Bỏ qua" (ghost)
- Click "Migrate" → POST /api/polls/migrate với pollIds từ localStorage → clear localStorage → refresh dashboard

**Multiple Choice:**
- CreatePoll form: checkbox "Cho phép chọn nhiều" → set allowMultiple = true
- Vote form: nếu poll.allowMultiple = true → checkboxes, else → radio buttons
- Submit vote: POST /api/polls/:id/vote với `optionIds` array

**Error Patterns:**
- Network error: toast "Mất kết nối mạng" + auto retry sau 3s
- 404 POLL_NOT_FOUND: alert "Poll không tồn tại" + button "Về Dashboard"
- 401 UNAUTHORIZED: toast "Phiên đăng nhập hết hạn" → redirect `/login`
- 403 FORBIDDEN: toast "Bạn không có quyền thực hiện hành động này"
- 400 POLL_CLOSED: toast "Poll đã đóng, không thể vote"

**Loading Patterns:**
- Initial load: skeleton components (không spinner)
- Action pending (create, delete, vote): button disable + inline spinner
- Background polling (3s): KHÔNG hiển thị loading indicator (silent refresh)

## Steps
1. ĐỌC `.openclaw/state.json` → lấy ports (BE_PORT: 3002, FE_PORT: 5174)
2. ĐỌC UX spec + checklist TRƯỚC — hiểu user thấy gì ở mỗi state
3. Setup REQUIRED stack:
   - `npx shadcn@latest init` (nếu chưa có)
   - Install: sonner, lucide-react, react-hook-form, zod, @tanstack/react-query, zustand, qrcode (hoặc react-qr-code)
4. Đọc types + tests từ Quinn để hiểu requirements
5. Implement FE theo UX spec — TỰ QUYẾT ĐỊNH cách tổ chức:
   - Dashboard page: tabs, list, filtering
   - PollDetail page: QR code, close/delete buttons, realtime polling
   - Auth pages: login, verify
   - Modals: close poll, delete poll, migrate polls
   - Multiple choice: checkbox UI
   - Error handling: toast feedback, retry buttons
6. BẮT BUỘC: Config Vite:
   - `allowedHosts: true`
   - Proxy `/api` → `http://localhost:3002`
   - Port: 5174
7. Nếu BE chưa xong → dùng MSW mock
8. Run: npx vitest run [test-path]
9. Iterate đến khi ALL GREEN
10. Post UX checklist completion status trong thread
11. Commit: git add -A && git commit -m "feat: implement dashboard-realtime frontend"

## Rules
- TOÀN QUYỀN: folder structure, routing, component organization
- **REQUIRED:** shadcn/ui cho mọi UI element, sonner cho toast, lucide-react cho icons
- **KHÔNG dùng HTML thuần** cho button, input, select, dialog
- TypeScript strict, no any
- Import shared types đã có
- KHÔNG sửa test assertions. NẾU test có lỗi setup → ĐƯỢC PHÉP fix setup.
- **UX spec + checklist là yêu cầu, không phải gợi ý.** Implement TẤT CẢ items.
- **Tự chủ thêm polish** nếu UX spec không cover — dùng best practices.
- **Heartbeat mỗi 10 phút** trong Discord thread

## Spec
[API contracts từ Marcus Spec — same as Sam task]

## UX Implementation Checklist
- [ ] shadcn/ui components (REQUIRED)
- [ ] Loading state: skeleton (không spinner)
- [ ] Error state: message + retry button
- [ ] Empty state: icon + message + CTA
- [ ] Toast feedback cho mutations (sonner)
- [ ] Button loading: disable + spinner khi pending
- [ ] Form validation: inline error dưới field
- [ ] Responsive: mobile-first
- [ ] Dashboard: grid layout, sort newest first, tabs filtering
- [ ] Poll detail: realtime polling mỗi 3s, smooth bar animation (0.3s ease transition)
- [ ] QR code: base64 image hiển thị + download button
- [ ] Delete modal: destructive button styling
- [ ] Close modal: confirmation với clear messaging
- [ ] Magic link: send → success message → verify flow
- [ ] Migrate modal: trigger sau login nếu có localStorage polls
- [ ] Network error: auto retry với exponential backoff
- [ ] Multiple choice: checkbox UI khi allowMultiple = true
- [ ] Closed poll: vote form disable + tooltip + badge
