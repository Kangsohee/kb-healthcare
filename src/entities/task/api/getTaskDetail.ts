import { apiClient } from '@/shared/api/apiClient'
import type { TaskDetailResponse } from '../model/types'

export async function getTaskDetail(id: string): Promise<TaskDetailResponse> {
  const { data } = await apiClient.get<TaskDetailResponse>(`/api/task/${id}`)
  return data
}
