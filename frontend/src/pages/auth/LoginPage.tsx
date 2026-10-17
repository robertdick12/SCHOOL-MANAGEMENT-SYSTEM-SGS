import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormField, Input, PasswordInput } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SchoolLogo } from '@/components/ui/SchoolLogo'
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
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* Decorative brand panel — hidden below md, this is where the "great for a school" feel lives */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 60% 70%, white 1.5px, transparent 1.5px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-3">
          <SchoolLogo className="h-11 w-11" />
          <span className="text-lg font-semibold tracking-tight">Sovereign Grace School</span>
        </div>

        <div className="relative max-w-sm">
          <p className="text-3xl font-semibold leading-snug">
            One portal for your whole school community.
          </p>
          <p className="mt-4 text-brand-100">
            Admissions, timetables, results, attendance, and fees — all in one secure place for
            administrators, teachers, students, and parents.
          </p>
        </div>

        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} Sovereign Grace School</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 md:w-1/2 dark:bg-slate-950">
        <div className="mb-6 flex w-full max-w-sm items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <SchoolLogo className="h-9 w-9" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sovereign Grace School</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your school portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="username" placeholder="you@school.com" {...register('email')} />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
            </FormField>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            {serverError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
