import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MigratePollsModal } from '../components/MigratePollsModal'

describe('MigratePollsModal', () => {
  function renderModal() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MigratePollsModal pollIds={['poll-1', 'poll-2']} open={true} onClose={() => {}} />
      </QueryClientProvider>,
    )
  }

  it('should render when localStorage polls exist', () => {
    renderModal()

    expect(screen.getByRole('heading', { name: /migrate|chuyển.*poll|liên kết/i })).toBeInTheDocument()
  })

  it('should render confirm and cancel actions', () => {
    renderModal()

    expect(screen.getByRole('button', { name: /migrate|confirm|chuyển|xác nhận/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel|hủy|skip|bỏ qua/i })).toBeInTheDocument()
  })
})
