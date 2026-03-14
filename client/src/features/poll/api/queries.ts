import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PollResults } from '@shared/types/poll'
import type {
  CreatePollRequest,
  CreatePollResponse,
  VoteRequest,
  VoteResponse,
  DashboardResponse,
  QRCodeData,
  ClosePollResponse,
  MigratePollsRequest,
  MigratePollsResponse,
} from '@shared/types/api'

export const pollKeys = {
  all: ['polls'] as const,
  detail: (id: string) => [...pollKeys.all, id] as const,
  qr: (id: string) => [...pollKeys.all, id, 'qr'] as const,
}

export function usePoll(pollId: string) {
  return useQuery({
    queryKey: pollKeys.detail(pollId),
    queryFn: () => api.get<PollResults>(`/polls/${pollId}`),
    enabled: !!pollId,
    refetchInterval: 3000, // Poll every 3s for real-time updates
  })
}

export function useCreatePoll() {
  return useMutation({
    mutationFn: (data: CreatePollRequest) => api.post<CreatePollResponse>('/polls', data),
  })
}

export function useVotePoll(pollId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VoteRequest) => api.post<VoteResponse>(`/polls/${pollId}/vote`, data),
    onSuccess: (res) => {
      qc.setQueryData(pollKeys.detail(pollId), res.results)
    },
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: pollKeys.all,
    queryFn: () => api.get<DashboardResponse>('/polls'),
  })
}

export function usePollQR(pollId: string) {
  return useQuery({
    queryKey: pollKeys.qr(pollId),
    queryFn: () => api.get<QRCodeData>(`/polls/${pollId}/qr`),
    enabled: !!pollId,
  })
}

export function useClosePoll(pollId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ClosePollResponse>(`/polls/${pollId}/close`),
    onSuccess: (res) => {
      qc.setQueryData(pollKeys.detail(pollId), (old: PollResults | undefined) =>
        old ? { ...old, poll: res.poll } : old,
      )
      qc.invalidateQueries({ queryKey: pollKeys.all })
    },
  })
}

export function useDeletePoll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pollId: string) => api.delete<{ success: boolean }>(`/polls/${pollId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pollKeys.all })
    },
  })
}

export function useMigratePolls() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MigratePollsRequest) => api.post<MigratePollsResponse>('/polls/migrate', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pollKeys.all })
    },
  })
}
