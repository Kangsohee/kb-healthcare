import { apiClient } from '@/shared/api/apiClient'
import type { DeleteTaskResponse } from '../model/types'

export async function deleteTask(id: string): Promise<DeleteTaskResponse> {
  const { data } = await apiClient.delete<DeleteTaskResponse>(`/api/task/${id}`)
  return data
}
