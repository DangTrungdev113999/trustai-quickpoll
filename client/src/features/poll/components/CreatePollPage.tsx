import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreatePoll } from '../api/queries'
import { createPollSchema, type CreatePollInput } from '../schemas/create-poll'

export function CreatePollPage() {
  const [optionCount, setOptionCount] = useState(2)
  const [successData, setSuccessData] = useState<{ question: string; shareUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const createPoll = useCreatePoll()

  const form = useForm<CreatePollInput>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      options: ['', ''],
    },
  })

  const options = form.watch('options')

  function addOption() {
    if (optionCount >= 5) return
    const newCount = optionCount + 1
    setOptionCount(newCount)
    form.setValue('options', [...options, ''])
  }

  function removeOption(index: number) {
    if (optionCount <= 2) return
    const newOptions = options.filter((_, i) => i !== index)
    setOptionCount(optionCount - 1)
    form.setValue('options', newOptions)
  }

  async function onSubmit(data: CreatePollInput) {
    try {
      const res = await createPoll.mutateAsync(data)
      setSuccessData({ question: data.question, shareUrl: res.shareUrl })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể kết nối. Thử lại sau')
    }
  }

  async function handleCopy() {
    if (!successData) return
    await navigator.clipboard.writeText(successData.shareUrl)
    setCopied(true)
    toast.success('Đã copy link')
    setTimeout(() => setCopied(false), 2000)
  }

  if (successData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[600px] space-y-6 text-center">
          <h1 className="text-3xl font-bold">{successData.question}</h1>
          <p className="text-muted-foreground">Poll đã tạo! Share link này để nhận vote</p>
          <div className="flex gap-2">
            <Input value={successData.shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopy} variant="outline">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isFormEmpty = !form.watch('question') && options.every((o) => !o)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[600px] space-y-6">
        <h1 className="text-3xl font-bold">Create Poll</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" placeholder="Câu hỏi của bạn?" {...form.register('question')} />
            {form.formState.errors.question && (
              <p className="text-sm text-destructive">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div className="space-y-3">
            {Array.from({ length: optionCount }).map((_, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`option-${i}`}>Option {i + 1}</Label>
                  <Input id={`option-${i}`} placeholder={`Lựa chọn ${i + 1}`} {...form.register(`options.${i}`)} />
                </div>
                {optionCount > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)} className="mb-0.5">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.options && (
              <p className="text-sm text-destructive">
                {form.formState.errors.options.message ?? form.formState.errors.options.root?.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={optionCount >= 5}
              title={optionCount >= 5 ? 'Tối đa 5 lựa chọn' : undefined}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isFormEmpty || createPoll.isPending}>
            {createPoll.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {createPoll.isPending ? 'Đang tạo...' : 'Create Poll'}
          </Button>
        </form>
      </div>
    </div>
  )
}
