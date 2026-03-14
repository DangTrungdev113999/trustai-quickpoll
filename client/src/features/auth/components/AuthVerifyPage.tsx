import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVerifyMagicLink } from '../api/queries'

export function AuthVerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const verify = useVerifyMagicLink()

  useEffect(() => {
    if (token && !verify.isSuccess && !verify.isPending && !verify.isError) {
      verify.mutate(
        { token },
        {
          onSuccess: () => {
            navigate('/dashboard', { replace: true })
          },
        },
      )
    }
  }, [token])

  if (verify.isError) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
            <CardTitle>Link không hợp lệ hoặc hết hạn</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>Về trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-4">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang xác thực...</p>
        </CardContent>
      </Card>
    </div>
  )
}
