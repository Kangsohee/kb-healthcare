import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { getUser } from '../api/getUser'

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: getUser,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
