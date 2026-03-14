import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClosePollModal } from '../components/ClosePollModal'

describe('ClosePollModal', () => {
  function renderModal() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <ClosePollModal pollId="test-poll-id" open={true} onClose={() => {}} />
      </QueryClientProvider>,
    )
  }

  it('should render modal title', () => {
    renderModal()

    expect(screen.getByRole('heading', { name: /close.*poll|đóng.*poll|xác nhận/i })).toBeInTheDocument()
  })

  it('should render confirm and cancel actions', () => {
    renderModal()

    expect(screen.getByRole('button', { name: /confirm|close|đóng|xác nhận/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel|hủy/i })).toBeInTheDocument()
  })
})
