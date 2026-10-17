import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormField, Input, PasswordInput } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { extractErrorMessage } from '@/api/client'
import { ROLE_HOME } from '@/components/layout/nav-config'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { user, login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) {
    return <Navigate to={ROLE_HOME[user.roles[0]]} replace />
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await login(values)
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sovereign Grace School</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to the school management system</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="username" {...register('email')} />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
            </FormField>

            {serverError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
