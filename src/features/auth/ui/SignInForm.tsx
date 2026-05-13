import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { ErrorModal } from './ErrorModal'
import { signInSchema, type SignInFormValues } from '../model/signInSchema'
import { useSignIn } from '../model/useSignIn'

interface SignInFormProps {
  redirectTo?: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const signIn = useSignIn(redirectTo)

  const onSubmit = async (values: SignInFormValues) => {
    try {
      await signIn.mutateAsync(values)
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { errorMessage?: string } } })?.response?.data
          ?.errorMessage ?? '로그인에 실패했습니다.'
      setErrorMessage(msg)
    }
  }

  const emailField = register('email')
  const passwordField = register('password')

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} className="flex flex-col gap-5">
        <Input
          id="email"
          label="이메일"
          type="email"
          placeholder="user@example.com"
          autoComplete="email"
          error={errors.email?.message}
          required
          {...emailField}
        />
        <Input
          id="password"
          label="비밀번호"
          type="password"
          placeholder="영문, 숫자 8~24자"
          autoComplete="current-password"
          error={errors.password?.message}
          required
          {...passwordField}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isValid}
          isLoading={isSubmitting}
          className="mt-2 w-full"
        >
          로그인
        </Button>
      </form>

      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage ?? ''}
        onClose={() => setErrorMessage(null)}
      />
    </>
  )
}
