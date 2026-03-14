import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { VotePollPage } from '../components/VotePollPage'

describe('VotePollPage', () => {
  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/poll/test-poll-id']}>
        <VotePollPage />
      </MemoryRouter>,
    )
  }

  it('should render the poll question as a heading', () => {
    renderPage()
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should render poll options as selectable elements', () => {
    renderPage()
    // Options should be rendered as radio buttons or similar selectable elements
    const options = screen.getAllByRole('radio')
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should render a vote/submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /vote|submit/i })).toBeInTheDocument()
  })
})
