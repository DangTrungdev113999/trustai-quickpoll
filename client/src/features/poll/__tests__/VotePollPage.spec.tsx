import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VotePollPage } from '../components/VotePollPage'

describe('VotePollPage', () => {
  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(['polls', 'test-poll-id'], {
      poll: {
        id: 'test-poll-id',
        question: 'What is your favorite color?',
        options: [
          { id: 'opt-1', text: 'Red' },
          { id: 'opt-2', text: 'Blue' },
        ],
        allowMultiple: false,
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      votes: [
        { optionId: 'opt-1', count: 0, percentage: 0 },
        { optionId: 'opt-2', count: 0, percentage: 0 },
      ],
      totalVotes: 0,
      hasVoted: false,
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/poll/test-poll-id']}>
          <Routes>
            <Route path="/poll/:pollId" element={<VotePollPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('should render the poll question as a heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /favorite color/i })).toBeInTheDocument()
  })

  it('should render poll options as selectable elements', () => {
    renderPage()
    // Options should be rendered as radio buttons or similar selectable elements
    const options = screen.getAllByRole('radio')
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should render a vote/submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument()
  })
})
