import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력하세요.'),
  password: z
    .string()
    .regex(/^[A-Za-z0-9]{8,24}$/, '비밀번호는 영문, 숫자 8~24자로 입력하세요.'),
})

export type SignInFormValues = z.infer<typeof signInSchema>
