import axios from 'axios'
import { env } from '@/shared/config/env'
import { useAuthStore } from '@/shared/store/authStore'
import { logger } from '@/shared/lib/logger'

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function flushQueue(token: string) {
  pendingQueue.forEach((p) => p.resolve(token))
  pendingQueue = []
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach((p) => p.reject(err))
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalConfig = error.config

    if (error.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalConfig.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalConfig))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${env.VITE_API_BASE_URL}/api/refresh`,
          {},
        )

        useAuthStore.getState().setAccessToken(data.accessToken)
        document.cookie = `token=${data.refreshToken}; path=/; SameSite=Strict`
        flushQueue(data.accessToken)

        originalConfig.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalConfig)
      } catch (refreshError) {
        logger.error('token refresh failed', { refreshError })
        rejectQueue(refreshError)
        useAuthStore.getState().clearAuth()
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
