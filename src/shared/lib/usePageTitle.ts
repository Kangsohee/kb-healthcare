import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} | KB헬스케어`
    return () => {
      document.title = prev
    }
  }, [title])
}
