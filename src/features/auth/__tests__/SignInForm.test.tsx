import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { SignInForm } from '../ui/SignInForm'

function createTestRouter() {
  const rootRoute = createRootRoute({ component: () => <SignInForm /> })
  const routeTree = rootRoute
  return createRouter({ routeTree })
}

function renderSignInForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  const router = createTestRouter()

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SignInForm', () => {
  it('이메일과 비밀번호 입력 필드가 렌더링된다', async () => {
    renderSignInForm()
    await waitFor(() => {
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    })
  })

  it('초기에 제출 버튼이 비활성화 상태다', async () => {
    renderSignInForm()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
    })
  })

  it('유효하지 않은 이메일 입력 시 에러 메시지가 표시된다', async () => {
    renderSignInForm()
    await waitFor(() => screen.getByLabelText('이메일'))

    await userEvent.type(screen.getByLabelText('이메일'), 'not-an-email')
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('유효한 이메일 + 유효한 비밀번호 입력 시 제출 버튼이 활성화된다', async () => {
    renderSignInForm()
    await waitFor(() => screen.getByLabelText('이메일'))

    await userEvent.type(screen.getByLabelText('이메일'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'abc12345')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인' })).not.toBeDisabled()
    })
  })

  it('잘못된 자격증명 제출 시 ErrorModal이 열린다', async () => {
    renderSignInForm()
    await waitFor(() => screen.getByLabelText('이메일'))

    await userEvent.type(screen.getByLabelText('이메일'), 'wrong@example.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })
})
