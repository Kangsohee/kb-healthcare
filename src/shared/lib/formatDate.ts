import { format } from 'date-fns'

export function formatDate(isoString: string): string {
  return format(new Date(isoString), 'yyyy.MM.dd HH:mm')
}
