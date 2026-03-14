# Backend — Coding Standards

## Architecture — Modular Services

### Folder Structure
```
server/src/
├── services/                    # Business logic
│   └── {serviceName}/
│       ├── docs.md              # READ FIRST — function specs
│       ├── index.ts             # Single named export
│       ├── types.ts             # Interfaces
│       ├── constants.ts         # UPPER_SNAKE_CASE + as const
│       └── libs/
│           ├── functionA.ts     # 1 function = 1 file
│           └── functionA.spec.ts
├── controllers/                 # Thin — extract params + call service
├── routes/                      # Route definitions
├── middleware/                  # Auth, error handler, etc.
└── lib/                         # Shared utilities (db, logger, etc.)
```

**Rule: 1 function = 1 file + 1 test file.** Không gộp.

## Workflow — Khi Implement Function Mới

1. **Đọc `docs.md`** trong service folder — đây là spec
2. **Viết test trước** (`libs/functionName.spec.ts`)
3. **Implement** (`libs/functionName.ts`)
4. **Run test** → GREEN
5. **Update `docs.md`** nếu thêm/sửa function
6. **Update `index.ts`** — export function mới

## Patterns

### Service Index
```ts
// services/todoService/index.ts
export * from './types'
export * from './constants'

import { createTodo } from './libs/createTodo'
import { getTodos } from './libs/getTodos'
import { updateTodo } from './libs/updateTodo'
import { deleteTodo } from './libs/deleteTodo'

export const todoService = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
}
```

### Types
```ts
// services/todoService/types.ts

// Naming: {FunctionName}Params, {FunctionName}Result
export interface CreateTodoParams {
  title: string
  description?: string
  userId: string
}

export interface CreateTodoResult {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}
```

### Service Function
```ts
// services/todoService/libs/createTodo.ts
import type { CreateTodoParams, CreateTodoResult } from '../types'

export async function createTodo(params: CreateTodoParams): Promise<CreateTodoResult> {
  const { title, description, userId } = params

  if (!title.trim()) {
    throw new Error('Title is required code:missing_title')
  }

  const todo = await db.todos.create({
    title: title.trim(),
    description: description?.trim() || null,
    userId,
    completed: false,
  })

  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt,
  }
}
```

### Error Handling — Error Code Pattern
```ts
// Format: "Human-readable message code:error_code"
throw new Error('Email already exists code:email_exists')
throw new Error('Permission denied code:permission_denied')
throw new Error('Not found code:not_found')

// Global error handler extracts:
// "Email already exists code:email_exists"
//   → { error: { code: "email_exists", message: "Email already exists" } }
```

Error handler middleware:
```ts
// middleware/errorHandler.ts
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const message = err.message || 'Internal server error'

  if (/ code:[a-zA-Z0-9_]{3,64}$/.test(message)) {
    const [msg, code] = message.split(' code:')
    return res.status(200).json({
      error: { code: code.trim(), message: msg.trim() },
    })
  }

  console.error(err)
  res.status(500).json({
    error: { code: 'error_system', message: 'Internal server error' },
  })
}
```

### Controller — Thin
```ts
// controllers/todoController.ts
import { todoService } from '../services/todoService'

export async function createTodo(req: Request, res: Response) {
  const { title, description } = req.body
  const userId = req.user.id

  const result = await todoService.createTodo({ title, description, userId })
  res.json({ data: result })
}
```

Controller rules:
- KHÔNG try/catch — global error handler xử lý
- KHÔNG viết logic — delegate cho service
- Extract params → validate → call service → return `{ data }`

### docs.md Template
```markdown
# Service: {ServiceName}

## Overview
[Purpose — 1-2 sentences]

## Functions

### functionName()
- **Input**: `FunctionNameParams` — { field: Type }
- **Output**: `Promise<FunctionNameResult>` — { field: Type }
- **Logic**:
  1. Validate input
  2. Process
  3. Return result
- **Errors**: `code:error_code` — when/why
```

### Test Pattern
```ts
// services/todoService/libs/createTodo.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createTodo } from './createTodo'

describe('createTodo', () => {
  it('should create todo with valid input', async () => {
    const result = await createTodo({
      title: 'Test',
      userId: 'user-1',
    })

    expect(result).toHaveProperty('id')
    expect(result.title).toBe('Test')
    expect(result.completed).toBe(false)
  })

  it('should throw on empty title', async () => {
    await expect(
      createTodo({ title: '', userId: 'user-1' })
    ).rejects.toThrow('code:missing_title')
  })

  it('should trim whitespace', async () => {
    const result = await createTodo({
      title: '  Test  ',
      userId: 'user-1',
    })

    expect(result.title).toBe('Test')
  })
})
```

Test strategy:
- Test happy path + edge cases + error cases
- Descriptive test names: `should [expected behavior]`
- 1 assertion focus per test (related assertions OK)

## Response Format
```ts
// Success
{ data: { ... } }

// Error
{ error: { code: 'error_code', message: 'Human-readable' } }

// List with pagination
{ data: [...], meta: { total: number, page: number, limit: number } }
```

## Logger
```ts
import { createLogger } from '../lib/logger'

const log = createLogger('ServiceName.functionName')

log.info({ data }, 'Description')
log.error({ error }, 'Description')
```

Tag format: `ServiceName.functionName` (PascalCase.camelCase)

## Code Style
- printWidth: 120
- No semicolons, single quotes, trailing commas
- 2-space indent
- Comments/JSDoc in English
- Constants: `UPPER_SNAKE_CASE` + `as const`
- Blank line before control statements (if/for/return) not at block start

## Research — Khi Không Chắc

Khi gặp vấn đề kỹ thuật không rõ → **dùng WebSearch**. Đừng đoán mò.

- Library API không rõ → search official docs
- Database query patterns → search best practices
- Error handling edge cases → search common patterns
- Official docs trước, blog posts sau
- 30 giây search nhanh hơn 30 phút debug sai hướng

## REQUIRED: Server Entry Point

Server PHẢI có file `src/index.ts` với `app.listen()` + start script trong package.json:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "test": "vitest run"
  }
}
```

```ts
// src/index.ts
import app from './app'
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

**KHÔNG được** submit code mà server không start được. Verify: `npm run dev` phải output "Server running on port X".

## Test
```bash
npx vitest run                                            # All tests
npx vitest run src/services/{name}/libs/{fn}.spec.ts      # Specific test
```
