# Decisions Log — quickpoll

> Append-only. Mỗi decision từ brainstorm PHẢI được log ở đây.
> Marcus PHẢI reference Decision IDs khi viết spec.

<!-- Format:
### D{NNN} — {topic}
- **Decided:** {quyết định}
- **By:** {ai đề xuất + ai đồng ý}
- **Milestone:** M{X}
- **Must appear in:** {spec / UX spec / implementation}
-->

## PLAN Thread Decisions

### D001 — M1 Landing Page
- **Decided:** Straight to Create Poll form (no landing page)
- **By:** Marcus (scope reduction), Alex confirmed
- **Milestone:** M1
- **Must appear in:** UX spec (route design)

### D002 — Options Limits
- **Decided:** Min 2, max 5 options cho M1
- **By:** Marcus (keeps UI simple), Alex confirmed
- **Milestone:** M1
- **Must appear in:** Spec (validation rules), UX spec (form design)

### D003 — Real-time Updates
- **Decided:** M1 static results, real-time defer M2
- **By:** Marcus (reduce complexity), Alex confirmed
- **Milestone:** M2
- **Must appear in:** M2 spec (WebSocket/polling implementation)

### D004 — QR Code
- **Decided:** M1 no QR code, defer M2
- **By:** Marcus (scope reduction), Alex confirmed
- **Milestone:** M2
- **Must appear in:** M2 UX spec (share options)

### D005 — Results Visibility
- **Decided:** Vote-only (phải vote mới thấy results)
- **By:** Marcus, Alex confirmed
- **Milestone:** M1
- **Must appear in:** Spec (business logic), UX spec (vote flow)

### D006 — Poll Ownership
- **Decided:** M1 localStorage (poll IDs), M2 magic link auth
- **By:** Marcus, Alex confirmed
- **Milestone:** M1 (localStorage), M2 (auth)
- **Must appear in:** M1 spec (localStorage design), M2 spec (auth flow)

### D007 — Multiple Choice
- **Decided:** Hide M1, show M2
- **By:** Marcus (clean M1 UI), Alex + Mia confirmed
- **Milestone:** M2
- **Must appear in:** M1 UX spec (form design - single choice only), M2 spec (multiple choice logic)

### D008 — Poll Lifecycle
- **Decided:** M1 active forever, M2 close poll
- **By:** Marcus, Alex confirmed
- **Milestone:** M2
- **Must appear in:** M2 spec (poll status management)

### D009 — Mobile-First Design
- **Decided:** Mobile-first mandatory (80% votes từ mobile)
- **By:** Mia (UX), Marcus confirmed
- **Milestone:** M1
- **Must appear in:** UX spec (responsive design, tap targets min 44px)

### D010 — Post-Create Success
- **Decided:** Success screen: shareable link + Copy button
- **By:** Marcus, Alex confirmed
- **Milestone:** M1
- **Must appear in:** UX spec (create flow), Spec (UI states)

### D011 — Vote Flow
- **Decided:** Question + radio buttons → Submit → static bar chart
- **By:** Mia (UX), Marcus confirmed
- **Milestone:** M1
- **Must appear in:** UX spec (vote page design)

### D012 — Already Voted State
- **Decided:** Show "Bạn đã vote" + results read-only
- **By:** Marcus (localStorage check), Mia (UX message)
- **Milestone:** M1
- **Must appear in:** Spec (vote validation), UX spec (already-voted state)

### D013 — Delete Poll Confirmation
- **Decided:** Confirm modal "Xóa poll này? Không thể hoàn tác." + "Hủy" / "Xóa" (red)
- **By:** Mia (UX)
- **Milestone:** M2
- **Must appear in:** M2 UX spec (dashboard interactions)

### D014 — Dashboard Sort
- **Decided:** Newest first (default sort)
- **By:** Mia (UX)
- **Milestone:** M2
- **Must appear in:** M2 spec (dashboard query)

### D015 — Poll Details Re-share
- **Decided:** Show link + copy + QR (M2)
- **By:** Mia (use case: re-share sau khi tạo)
- **Milestone:** M2
- **Must appear in:** M2 UX spec (poll detail page)

### D016 — IP-based Anti-spam
- **Decided:** M1 có IP-based limiting (1 vote per IP per poll, backend only)
- **By:** Alex (critical for UX), Marcus confirmed
- **Milestone:** M1
- **Must appear in:** Spec (vote validation logic)

### D017 — LocalStorage Vote Check
- **Decided:** Check localStorage for "Already voted"
- **By:** Marcus
- **Milestone:** M1
- **Must appear in:** Spec (vote validation - dual check: localStorage + IP)

### D018 — M1 Error Handling
- **Decided:** 404 page (poll not found), already voted message, generic error toast
- **By:** Marcus, Mia (UX)
- **Milestone:** M1
- **Must appear in:** UX spec (error states), Spec (error responses)

### D019 — Real-time Updates Implementation
- **Decided:** M2 WebSocket/polling
- **By:** Marcus
- **Milestone:** M2
- **Must appear in:** M2 spec (real-time architecture)

### D020 — Polling-Based Real-time (M2)
- **Decided:** M2 có polling-based real-time (poll API mỗi 3s khi xem results), WebSocket defer M3+
- **By:** Alex (core feature requirement), Marcus confirmed
- **Milestone:** M2
- **Must appear in:** M2 spec (polling implementation, API endpoint)

### D021 — LocalStorage to Auth Migration
- **Decided:** M1 localStorage ownership, M2 magic link auth (migrate existing polls)
- **By:** Marcus, Alex confirmed
- **Milestone:** M2
- **Must appear in:** M2 spec (auth flow, migration logic)

### D022 — Vote Results Visibility Rule
- **Decided:** Phải vote mới thấy results (no "Xem trước" option)
- **By:** Marcus, Alex confirmed
- **Milestone:** M1
- **Must appear in:** Spec (access control logic), UX spec (vote page - no preview link)
