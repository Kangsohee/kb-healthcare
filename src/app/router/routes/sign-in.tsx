import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SignInPage } from '@/pages/sign-in'

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: signInSearchSchema,
  component: SignInPage,
})
