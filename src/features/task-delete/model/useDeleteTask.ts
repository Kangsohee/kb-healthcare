import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { deleteTask } from '@/entities/task'
import { queryKeys } from '@/shared/api/queryKeys'
import { logger } from '@/shared/lib/logger'

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (_data, id) => {
      logger.info('task deleted', { taskId: id })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      router.navigate({ to: '/task' })
    },
    onError: (error, id) => {
      logger.error('task delete failed', { taskId: id, error })
      toast.error('삭제 중 오류가 발생했습니다.')
    },
  })
}
