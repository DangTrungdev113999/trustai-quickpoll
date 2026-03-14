import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X, Copy, Check, LayoutDashboard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useCreatePoll } from '../api/queries'
import { createPollSchema, type CreatePollInput } from '../schemas/create-poll'

export function CreatePollPage() {
  const navigate = useNavigate()
  const [optionCount, setOptionCount] = useState(2)
  const [successData, setSuccessData] = useState<{
    pollId: string
    question: string
    shareUrl: string
  } | null>(null)
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
      setSuccessData({
        pollId: res.pollId,
        question: data.question,
        shareUrl: res.shareUrl,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể kết nối. Thử lại sau')
    }
  }

  async function handleCopy() {
    if (!successData) return
    const fullUrl = `${window.location.origin}${successData.shareUrl}`
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success('Đã copy link')
    setTimeout(() => setCopied(false), 2000)
  }

  if (successData) {
    const fullUrl = `${window.location.origin}${successData.shareUrl}`
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[600px] space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{successData.question}</h1>
            <p className="mt-2 text-muted-foreground">✅ Poll đã tạo thành công!</p>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share link (cho voters):</Label>
                <div className="flex gap-2">
                  <Input value={fullUrl} readOnly className="flex-1 text-sm" />
                  <Button onClick={handleCopy} variant="outline" size="icon">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gửi link này cho mọi người để họ vote
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                  variant="default"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Xem trên Dashboard
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Dashboard: xem kết quả real-time, QR code, quản lý polls
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(fullUrl, '_blank')}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Xem vote page
                  </Button>
                  <Button onClick={() => navigate('/create')} variant="outline" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo poll mới
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
