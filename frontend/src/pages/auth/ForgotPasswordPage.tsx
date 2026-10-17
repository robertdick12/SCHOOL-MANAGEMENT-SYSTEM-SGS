import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { passwordResetApi } from '@/api/passwordReset'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SchoolLogo } from '@/components/ui/SchoolLogo'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const forgotMutation = useMutation({ mutationFn: passwordResetApi.forgot })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const result = await forgotMutation.mutateAsync(values.email)
      setSentMessage(result.message)
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
          {sentMessage ? (
            <div className="text-center">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Check your email</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sentMessage}</p>
              <Link to="/login" className="mt-4 inline-block">
                <Button variant="secondary">Back to sign in</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reset your password</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="email" {...register('email')} />
                </FormField>

                {serverError && (
                  <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    {serverError}
                  </p>
                )}

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Send reset link
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                    Back to sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
