# Frontend — Coding Standards

## REQUIRED Stack (BẮT BUỘC setup ở bước đầu tiên)

```bash
# Step 1: Init project
npm create vite@latest . -- --template react-ts
npm i

# Step 2: REQUIRED libs — install TẤT CẢ ngay
npx shadcn@latest init
npm i lucide-react react-hook-form @hookform/resolvers zod @tanstack/react-query zustand sonner date-fns
npm i -D @tailwindcss/vite

# Step 3: shadcn/ui base components
npx shadcn@latest add button input label card dialog select
```

| Category | Library | Status |
|----------|---------|--------|
| UI Components | shadcn/ui | **REQUIRED** — dùng cho MỌI form element, button, card |
| Icons | lucide-react | **REQUIRED** |
| Forms | React Hook Form + zod | **REQUIRED** |
| Server State | TanStack Query v5 | **REQUIRED** |
| Client State | Zustand | **REQUIRED** |
| Toast | Sonner | **REQUIRED** — mọi mutation phải có toast |
| Dates | date-fns | Install khi cần |
| Animation | Motion | Install khi cần |

**KHÔNG dùng HTML thuần** cho input, button, select, dialog. Phải dùng shadcn/ui components.

## Folder Structure — Feature-based
```
client/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx       # QueryClientProvider, Toaster, etc.
├── features/
│   └── {feature}/
│       ├── components/     # Feature UI components
│       ├── hooks/          # useXxx custom hooks
│       ├── api/            # API calls + query hooks
│       ├── schemas/        # Zod validation schemas
│       └── index.ts        # Public exports
├── components/
│   └── ui/                 # shadcn/ui generated
├── hooks/                  # Shared hooks
├── lib/
│   ├── api.ts              # API client (fetch/axios wrapper)
│   └── utils.ts            # cn() helper, etc.
└── styles/
    └── globals.css
```

**Rule: 1 feature = 1 folder.** Component chỉ dùng trong 1 feature → đặt trong feature đó. Dùng ở nhiều nơi → `components/`.

## Patterns

### API Layer (TanStack Query)
```tsx
// features/todos/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Todo, CreateTodoInput } from '@shared/types'

export const todoKeys = {
  all: ['todos'] as const,
  list: (filters?: object) => [...todoKeys.all, 'list', filters] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
}

export function useTodos(filters = {}) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => api.get<Todo[]>('/api/todos', { params: filters }),
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTodoInput) => api.post<Todo>('/api/todos', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: todoKeys.all }),
  })
}
```

### Form (React Hook Form + Zod)
```tsx
// features/todos/schemas/create-todo.ts
import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Required').max(200),
  description: z.string().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>

// features/todos/components/CreateTodoForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTodoSchema, type CreateTodoInput } from '../schemas/create-todo'

export function CreateTodoForm({ onSubmit }: { onSubmit: (data: CreateTodoInput) => void }) {
  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: { title: '', description: '' },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... fields with form.register() ... */}
    </form>
  )
}
```

### Component States — REQUIRED
Mọi component có async data PHẢI handle 4 states:

```tsx
function TodoList() {
  const { data, isLoading, error, refetch } = useTodos()

  if (isLoading) return <TodoListSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!data?.length) return <EmptyState icon={ListTodo} title="No todos yet" action={<CreateButton />} />

  return (
    <ul>
      {data.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </ul>
  )
}
```

| State | Pattern | Notes |
|-------|---------|-------|
| Loading | Skeleton (không spinner) | Skeleton giữ layout, spinner gây CLS |
| Error | Message + Retry button | Luôn cho user cách retry |
| Empty | Icon + Message + CTA | Hướng user tạo item đầu tiên |
| Success | Render data | |

### Toast Feedback (Sonner)
```tsx
import { toast } from 'sonner'

// Mutations luôn có feedback
const mutation = useCreateTodo()

function handleCreate(data: CreateTodoInput) {
  toast.promise(mutation.mutateAsync(data), {
    loading: 'Creating...',
    success: 'Created!',
    error: (err) => err.message,
  })
}
```

### Button Loading
```tsx
<Button disabled={mutation.isPending}>
  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Save
</Button>
```

## UX Quality Checklist
- [ ] Skeleton loading cho mọi async operation
- [ ] Error state có retry
- [ ] Empty state có CTA
- [ ] Toast cho mọi mutation
- [ ] Button disable + spinner khi pending
- [ ] Form validation inline (dưới field)
- [ ] Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- [ ] Icons cho actions (lucide-react)
- [ ] Keyboard accessible (focus states, tab order)

## Vite Config — REQUIRED
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
})
```

## Research — Khi Không Chắc

Khi gặp vấn đề kỹ thuật không rõ → **dùng WebSearch**. Đừng đoán mò.

- Library API không rõ → search official docs
- Pattern/config lạ → search examples
- Error message khó hiểu → search exact error
- Official docs trước, blog posts sau
- 30 giây search nhanh hơn 30 phút debug sai hướng

## Test
```bash
npx vitest run                     # All tests
npx vitest run --reporter=verbose  # Verbose
npx vitest run src/features/todos  # Feature tests
```
