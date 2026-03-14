import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PollResults } from '@shared/types/poll'
import type { CreatePollRequest, CreatePollResponse, VoteRequest, VoteResponse } from '@shared/types/api'

export const pollKeys = {
  all: ['polls'] as const,
  detail: (id: string) => [...pollKeys.all, id] as const,
}

export function usePoll(pollId: string) {
  return useQuery({
    queryKey: pollKeys.detail(pollId),
    queryFn: () => api.get<PollResults>(`/polls/${pollId}`),
    enabled: !!pollId,
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
