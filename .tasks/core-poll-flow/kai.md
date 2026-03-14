# Task: Implement Core Poll Flow Frontend

## Tests cần pass
Tất cả FE tests từ Quinn trong feature/core-poll-flow branch

## UX Spec

### Create Poll Page

**States:**
- **Default:** Form hiện question input (placeholder: "Câu hỏi của bạn?") + 2 option inputs ban đầu + button "Thêm lựa chọn" (max 5) + button "Tạo Poll" (primary, disabled khi empty)
- **Loading:** Button "Tạo Poll" → spinner + disable, text "Đang tạo..."
- **Error:** Toast (sonner) hiện lỗi validation ("Cần ít nhất 2 lựa chọn", "Tối đa 5 lựa chọn", "Không được trùng lặp")
- **Success:** Full-screen success view với poll question to, shareUrl text box + Copy button (icon + text), message nhỏ "Poll đã tạo! Share link này để nhận vote"

**Interactions:**
- Click "Thêm lựa chọn": thêm option input mới (max 5), nếu đã đủ 5 → button disable + tooltip "Tối đa 5 lựa chọn"
- Xóa option: X icon bên phải input (chỉ hiện khi > 2 options), click → remove input với fade-out 200ms
- Click "Tạo Poll": validate → POST /api/polls → success screen hoặc toast error
- Click Copy: copy shareUrl → button text "Copied!" 2s → back to "Copy", toast "Đã copy link"

**Responsive:**
- Mobile: single column, inputs full-width, button sticky bottom với safe area, tap targets min 44px
- Desktop: centered card max-width 600px, inputs comfortable spacing

### Vote Page (/:pollId)

**States:**
- **Default:** Poll question (h1, bold), radio buttons với option text (body), Submit button disabled khi chưa chọn
- **Loading:** Skeleton cho question (shimmer bar) + 3 skeleton radio items khi fetch poll
- **Already Voted:** Hiện results ngay, message top "Bạn đã vote rồi" (info banner, blue background)
- **Error 404:** Empty state icon (search x), text "Poll không tồn tại", button "Tạo poll mới" → redirect /
- **Voted (after submit):** Results view, message "Bạn đã vote!" (success banner, green background), Submit button biến mất

**Interactions:**
- Chọn option: radio checked, Submit button enable với primary color
- Click Submit: button → spinner + disable → POST /api/polls/:id/vote → results hiện với slide-up animation 300ms
- Results view: bar chart, mỗi option = row (option text + bar + percentage + count), bars animate width từ 0 → final % trong 400ms stagger 100ms

**Responsive:**
- Mobile: radio buttons to (min 44px), results bars full-width với label trên, numbers bên phải
- Desktop: results compact, label left + bar middle + numbers right inline

### Error Patterns (chung)

- **Network error:** Toast "Không thể kết nối. Thử lại sau" + retry button trong toast
- **Validation error:** Toast hiện inline dưới input (red text, small)
- **404:** Empty state trong page (không toast)

### Loading Patterns (chung)

- **Initial load (vote page):** Skeleton cho question + options (không spinner)
- **Action pending (create/vote):** Button spinner + disable + text change ("Đang tạo...", "Đang gửi...")
- **Results load:** Bars animate vào (không skeleton cho results)

### UX Implementation Checklist

- [ ] shadcn/ui components (REQUIRED: Button, Input, RadioGroup, Toast/sonner)
- [ ] Loading state: skeleton cho poll load (không spinner)
- [ ] Error state: toast cho validation, empty state cho 404
- [ ] Empty state: icon + message + CTA cho poll not found
- [ ] Toast feedback: copy success, vote success, errors (sonner)
- [ ] Button loading: disable + spinner khi POST
- [ ] Form validation: inline error dưới inputs
- [ ] Responsive: mobile-first, tap targets min 44px
- [ ] Results animation: bars slide-in 400ms, stagger 100ms
- [ ] Anti-spam: localStorage check trước submit (disable nếu đã vote)
- [ ] Success screen: full-screen với shareUrl copy (không modal)

## Steps
1. ĐỌC `.openclaw/state.json` → lấy ports (BE_PORT: 3002, FE_PORT: 5174)
2. ĐỌC UX spec + UX checklist TRƯỚC — hiểu user thấy gì, cảm gì ở mỗi state
3. Setup REQUIRED stack: `npx shadcn@latest init` + install sonner, lucide-react, react-hook-form, zod, @tanstack/react-query, zustand
4. Đọc types + tests để hiểu requirements
5. Implement FE theo UX spec — TỰ QUYẾT ĐỊNH cách tổ chức
6. BẮT BUỘC: Config Vite `allowedHosts: true`, proxy `/api` → `localhost:3002`, port: 5174
7. Nếu BE chưa xong → dùng MSW mock
8. Run: npx vitest run [test-path]
9. Iterate đến khi ALL GREEN
10. Post UX checklist completion status trong thread
11. Commit: git add -A && git commit -m "feat: implement core-poll-flow frontend"

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

**API Contracts:**

**POST /api/polls**
- Request: `CreatePollRequest { question: string; options: string[]; // 2-5 items }`
- Response 201: `CreatePollResponse { pollId: string; shareUrl: string; }`

**GET /api/polls/:id**
- Response 200: `PollResults { poll: Poll; votes: VoteCount[]; totalVotes: number; hasVoted: boolean; }`

**POST /api/polls/:id/vote**
- Request: `VoteRequest { optionId: string; }`
- Response 200: `VoteResponse { success: boolean; results: PollResults; }`
