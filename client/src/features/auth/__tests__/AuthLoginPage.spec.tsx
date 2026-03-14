import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthLoginPage } from '../components/AuthLoginPage'

describe('AuthLoginPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthLoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render email input field', () => {
    renderPage()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderPage()

    expect(screen.getByRole('button', { name: /send|gửi|đăng nhập|login/i })).toBeInTheDocument()
  })
})
