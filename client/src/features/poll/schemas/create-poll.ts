import { z } from 'zod'

export const createPollSchema = z.object({
  question: z.string().min(1, 'Câu hỏi không được để trống'),
  options: z
    .array(z.string().min(1, 'Lựa chọn không được để trống'))
    .min(2, 'Cần ít nhất 2 lựa chọn')
    .max(5, 'Tối đa 5 lựa chọn')
    .refine((opts) => new Set(opts).size === opts.length, 'Không được trùng lặp'),
})

export type CreatePollInput = z.infer<typeof createPollSchema>
