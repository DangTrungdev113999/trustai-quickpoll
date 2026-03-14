import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  SendMagicLinkRequest,
  SendMagicLinkResponse,
  VerifyMagicLinkRequest,
  VerifyMagicLinkResponse,
} from '@shared/types/api'

export function useSendMagicLink() {
  return useMutation({
    mutationFn: (data: SendMagicLinkRequest) => api.post<SendMagicLinkResponse>('/auth/send-magic-link', data),
  })
}

export function useVerifyMagicLink() {
  return useMutation({
    mutationFn: (data: VerifyMagicLinkRequest) => api.post<VerifyMagicLinkResponse>('/auth/verify-magic-link', data),
  })
}
