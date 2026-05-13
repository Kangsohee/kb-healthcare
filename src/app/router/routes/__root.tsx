import axios from 'axios'
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/widgets/app-layout'
import { useAuthStore } from '@/shared/store/authStore'
import { logger } from '@/shared/lib/logger'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

async function attemptSilentRefresh() {
  if (!document.cookie.includes('token=')) return

  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      '/api/refresh',
    )
    useAuthStore.getState().setAccessToken(data.accessToken)
    document.cookie = `token=${data.refreshToken}; path=/; SameSite=Strict`
    logger.info('silent refresh succeeded')
  } catch {
    logger.warn('silent refresh failed — staying unauthenticated')
  }
}

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { accessToken } = useAuthStore.getState()

    if (!accessToken) {
      await attemptSilentRefresh()
    }

    const tokenAfterRefresh = useAuthStore.getState().accessToken
    logger.info('route access', { pathname: location.pathname, authenticated: !!tokenAfterRefresh })

    if (!tokenAfterRefresh && location.pathname !== '/sign-in') {
      throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: () => (
    <AppLayout>
      <NotFoundPage />
    </AppLayout>
  ),
})
