import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BarChart3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboard } from '@/features/poll/api/queries'
import { DeletePollModal } from '@/features/poll/components/DeletePollModal'

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

type TabValue = 'all' | 'active' | 'closed'

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const polls = data?.polls ?? []
  const filteredPolls = polls
    .filter((p) => {
      if (activeTab === 'active') return p.status === 'active'
      if (activeTab === 'closed') return p.status === 'closed'
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  function renderContent() {
    if (isLoading) return <DashboardSkeleton />

    if (error) {
      return (
        <Card className="text-center">
          <CardContent className="space-y-4 py-8">
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </CardContent>
        </Card>
      )
    }

    if (filteredPolls.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có poll nào</p>
          <Button onClick={() => navigate('/')}>Tạo poll mới</Button>
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPolls.map((poll) => (
          <Card
            key={poll.id}
            className="group relative cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/poll/${poll.id}`)}
          >
            {poll.status === 'closed' && (
              <Badge variant="secondary" className="absolute right-3 top-3">
                Đã đóng
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="line-clamp-2 text-base">{poll.question}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{poll.totalVotes} votes</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(poll.id)
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/')}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo poll mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đang mở</TabsTrigger>
          <TabsTrigger value="closed">Đã đóng</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderContent()}

      {deleteTarget && (
        <DeletePollModal pollId={deleteTarget} open={true} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
