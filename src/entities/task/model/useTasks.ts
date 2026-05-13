import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { getTasks } from '../api/getTasks'

export function useTasks() {
  return useInfiniteQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: ({ pageParam }) => getTasks(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
  })
}
