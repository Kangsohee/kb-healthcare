import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { getDashboard } from '../api/getDashboard'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })
}
