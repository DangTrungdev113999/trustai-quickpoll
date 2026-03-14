import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSendMagicLink } from '../api/queries'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type LoginForm = z.infer<typeof loginSchema>

export function AuthLoginPage() {
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const sendMagicLink = useSendMagicLink()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: LoginForm) {
    sendMagicLink.mutate(data, {
      onSuccess: () => {
        setSentEmail(data.email)
      },
      onError: (err) => {
        toast.error(err.message)
      },
    })
  }

  if (sentEmail) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <Mail className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
            <CardTitle>Kiểm tra hộp thư</CardTitle>
            <CardDescription>Magic link đã gửi đến {sentEmail}. Kiểm tra hộp thư.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Nhập email để nhận magic link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={sendMagicLink.isPending}>
              {sendMagicLink.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi magic link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
