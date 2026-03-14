import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreatePollPage } from '../components/CreatePollPage'

describe('CreatePollPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CreatePollPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /tạo poll mới/i })).toBeInTheDocument()
  })

  it('should render a question input field', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /câu hỏi/i })).toBeInTheDocument()
  })

  it('should render at least 2 option input fields by default', () => {
    renderPage()
    const optionInputs = screen.getAllByRole('textbox', { name: /lựa chọn/i })
    expect(optionInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('should render an add option button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /thêm lựa chọn/i })).toBeInTheDocument()
  })

  it('should render a submit/create button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /tạo poll/i })).toBeInTheDocument()
  })
})
