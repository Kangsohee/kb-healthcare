export const queryKeys = {
  dashboard: ['dashboard'] as const,
  tasks: {
    all: ['tasks'] as const,
    list: () => [...queryKeys.tasks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
  },
  user: ['user'] as const,
}
