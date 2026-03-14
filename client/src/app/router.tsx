import { createBrowserRouter } from 'react-router-dom'
import { CreatePollPage } from '@/features/poll/components/CreatePollPage'
import { VotePollPage } from '@/features/poll/components/VotePollPage'

export const router = createBrowserRouter([
  { path: '/', element: <CreatePollPage /> },
  { path: '/poll/:pollId', element: <VotePollPage /> },
])
