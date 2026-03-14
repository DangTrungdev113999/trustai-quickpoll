import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from '../components/DashboardPage'

describe('DashboardPage', () => {
  function renderPage(queryData?: { polls: Array<{ id: string; question: string; totalVotes: number; status: string; createdAt: string }> }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    if (queryData) {
      queryClient.setQueryData(['polls'], queryData)
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render list of polls', () => {
    renderPage({
      polls: [
        { id: '1', question: 'First poll?', totalVotes: 5, status: 'active', createdAt: '2026-03-14T00:00:00Z' },
        { id: '2', question: 'Second poll?', totalVotes: 3, status: 'closed', createdAt: '2026-03-13T00:00:00Z' },
      ],
    })

    expect(screen.getByText('First poll?')).toBeInTheDocument()
    expect(screen.getByText('Second poll?')).toBeInTheDocument()
  })

  it('should render empty state when no polls exist', () => {
    renderPage({ polls: [] })

    expect(screen.getByText(/no polls|chưa có poll|chưa tạo/i)).toBeInTheDocument()
  })

  it('should render filter tabs (Tất cả / Đang mở / Đã đóng)', () => {
    renderPage()

    expect(screen.getByRole('tab', { name: /tất cả|all/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /đang mở|active/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /đã đóng|closed/i })).toBeInTheDocument()
  })
})
