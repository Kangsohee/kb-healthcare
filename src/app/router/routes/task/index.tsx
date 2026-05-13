import { createFileRoute } from '@tanstack/react-router'
import { TaskListPage } from '@/pages/task-list'

export const Route = createFileRoute('/task/')({
  component: TaskListPage,
})
