import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { passwordResetApi } from '@/api/passwordReset'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormField, PasswordInput } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SchoolLogo } from '@/components/ui/SchoolLogo'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const resetMutation = useMutation({ mutationFn: passwordResetApi.reset })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await resetMutation.mutateAsync({ token, email, password: values.password })
      navigate('/login', { state: { passwordReset: true } })
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SchoolLogo className="h-9 w-9" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sovereign Grace School</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Choose a new password</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">For {email || 'your account'}</p>

          {!token || !email ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              This reset link is missing information. Request a new one from the{' '}
              <Link to="/forgot-password" className="underline">
                forgot password
              </Link>{' '}
              page.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField label="New password" htmlFor="password" error={errors.password?.message}>
                <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
              </FormField>

              <FormField
                label="Confirm new password"
                htmlFor="password_confirmation"
                error={errors.password_confirmation?.message}
              >
                <PasswordInput id="password_confirmation" autoComplete="new-password" {...register('password_confirmation')} />
              </FormField>

              {serverError && (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Reset password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
