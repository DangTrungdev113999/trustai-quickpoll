import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthVerifyPage } from '../components/AuthVerifyPage'

describe('AuthVerifyPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/auth/verify?token=test-token']}>
          <Routes>
            <Route path="/auth/verify" element={<AuthVerifyPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render loading state while verifying', () => {
    renderPage()

    expect(screen.getByText(/verifying|đang xác thực|loading/i)).toBeInTheDocument()
  })
})
