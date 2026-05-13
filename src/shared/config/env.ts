export const env = {
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',
  VITE_API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) ?? '/',
  DEV: import.meta.env.DEV,
} as const
