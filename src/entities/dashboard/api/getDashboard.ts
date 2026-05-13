import { apiClient } from '@/shared/api/apiClient'
import type { DashboardResponse } from '../model/types'

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>('/api/dashboard')
  return data
}
