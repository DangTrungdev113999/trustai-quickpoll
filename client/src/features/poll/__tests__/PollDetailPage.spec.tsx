import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PollDetailPage } from '../components/PollDetailPage'

describe('PollDetailPage', () => {
  function renderPage(overrides?: { status?: string; ownerId?: string; currentUserId?: string }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const status = overrides?.status ?? 'active'
    const ownerId = overrides?.ownerId

    queryClient.setQueryData(['polls', 'test-poll-id'], {
      poll: {
        id: 'test-poll-id',
        question: 'What is your favorite color?',
        options: [
          { id: 'opt-1', text: 'Red' },
          { id: 'opt-2', text: 'Blue' },
        ],
        allowMultiple: false,
        status,
        ownerId,
        createdAt: '2026-01-01T00:00:00Z',
      },
      votes: [
        { optionId: 'opt-1', count: 3, percentage: 60 },
        { optionId: 'opt-2', count: 2, percentage: 40 },
      ],
      totalVotes: 5,
      hasVoted: false,
    })

    queryClient.setQueryData(['polls', 'test-poll-id', 'qr'], {
      pollId: 'test-poll-id',
      shareUrl: 'https://example.com/poll/test-poll-id',
      qrCodeDataUrl: 'data:image/png;base64,abc123',
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/poll/test-poll-id']}>
          <Routes>
            <Route path="/poll/:pollId" element={<PollDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render poll question and options', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /what is your favorite color/i })).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
  })

  it('should render QR code image', () => {
    renderPage()

    expect(screen.getByRole('img', { name: /qr/i })).toBeInTheDocument()
  })

  it('should render "Close poll" button for owner', () => {
    renderPage({ ownerId: 'user-1', currentUserId: 'user-1' })

    expect(screen.getByRole('button', { name: /close.*poll|đóng.*poll/i })).toBeInTheDocument()
  })

  it('should render "Delete poll" button for owner', () => {
    renderPage({ ownerId: 'user-1', currentUserId: 'user-1' })

    expect(screen.getByRole('button', { name: /delete.*poll|xóa.*poll/i })).toBeInTheDocument()
  })

  it('should render "Đã đóng" badge when status = closed', () => {
    renderPage({ status: 'closed' })

    expect(screen.getByText(/đã đóng|closed/i)).toBeInTheDocument()
  })
})
