import { apiClient } from '@/shared/api/apiClient'
import type { TaskListResponse } from '../model/types'

export async function getTasks(page: number): Promise<TaskListResponse> {
  const { data } = await apiClient.get<TaskListResponse>('/api/task', { params: { page } })
  return data
}
