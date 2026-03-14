import { createBrowserRouter } from 'react-router-dom'
import { CreatePollPage } from '@/features/poll/components/CreatePollPage'
import { VotePollPage } from '@/features/poll/components/VotePollPage'
import { PollDetailPage } from '@/features/poll/components/PollDetailPage'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { AuthLoginPage } from '@/features/auth/components/AuthLoginPage'
import { AuthVerifyPage } from '@/features/auth/components/AuthVerifyPage'

export const router = createBrowserRouter([
  { path: '/', element: <CreatePollPage /> },
  { path: '/poll/:pollId', element: <VotePollPage /> },
  { path: '/polls/:pollId', element: <PollDetailPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/login', element: <AuthLoginPage /> },
  { path: '/auth/verify', element: <AuthVerifyPage /> },
])
