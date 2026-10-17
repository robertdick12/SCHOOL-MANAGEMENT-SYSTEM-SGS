import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/auth/AuthContext'
import { ThemeProvider } from '@/theme/ThemeContext'
import { LoginPage } from './LoginPage'
import { api } from '@/api/client'

vi.mock('@/api/client', async () => {
  const actual = await vi.importActual<typeof import('@/api/client')>('@/api/client')
  return {
    ...actual,
    ensureCsrfCookie: vi.fn().mockResolvedValue(undefined),
    api: { get: vi.fn(), post: vi.fn() },
  }
})

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  it('shows validation errors when submitted empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null })
    const user = userEvent.setup()
    renderLoginPage()

    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  it('rejects a malformed email', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null })
    const user = userEvent.setup()
    renderLoginPage()

    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled())
    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'something')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('shows the server error message when login fails', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null })
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'These credentials do not match our records.' } },
    })
    const user = userEvent.setup()
    renderLoginPage()

    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled())
    await user.type(screen.getByLabelText('Email address'), 'admin@school.test')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('These credentials do not match our records.')
  })
})
