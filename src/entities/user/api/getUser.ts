import { apiClient } from '@/shared/api/apiClient'
import type { UserResponse } from '../model/types'

export async function getUser(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/api/user')
  return data
}
