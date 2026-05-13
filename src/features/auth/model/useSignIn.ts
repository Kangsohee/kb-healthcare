import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { apiClient } from '@/shared/api/apiClient'
import { useAuthStore } from '@/shared/store/authStore'
import { logger } from '@/shared/lib/logger'
import type { SignInFormValues } from './signInSchema'

interface SignInResponse {
  accessToken: string
  refreshToken: string
}

interface SignInError {
  errorMessage: string
}

export function useSignIn(redirectTo?: string) {
  const router = useRouter()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation<SignInResponse, { response?: { data: SignInError } }, SignInFormValues>({
    mutationFn: (values) =>
      apiClient.post<SignInResponse>('/api/sign-in', values).then((r) => r.data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      document.cookie = `token=${data.refreshToken}; path=/; SameSite=Strict`
      router.navigate({ to: redirectTo ?? '/' })
    },
    onError: (error) => {
      logger.error('sign-in failed', { message: error.response?.data?.errorMessage })
    },
  })
}
