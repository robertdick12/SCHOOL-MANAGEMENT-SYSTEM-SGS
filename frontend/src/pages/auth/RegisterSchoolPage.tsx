import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { schoolRegistrationApi } from '@/api/platform'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormField, Input, PasswordInput } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const schema = z.object({
  school_name: z.string().min(2, 'School name is required'),
  address: z.string().optional(),
  contact_phone: z.string().optional(),
  admin_name: z.string().min(2, "Admin's full name is required"),
  admin_email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  admin_password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function RegisterSchoolPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const registerMutation = useMutation({
    mutationFn: schoolRegistrationApi.register,
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const result = await registerMutation.mutateAsync(values)
      setSuccessMessage(result.message)
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Register your school</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set up your school&apos;s portal. An administrator approves new schools before staff can log in.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {successMessage ? (
            <div className="text-center">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{successMessage}</p>
              <Link to="/login" className="mt-4 inline-block">
                <Button variant="secondary">Back to sign in</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="School name" htmlFor="school_name" error={errors.school_name?.message}>
                <Input id="school_name" {...register('school_name')} />
              </FormField>

              <FormField label="Address (optional)" htmlFor="address" error={errors.address?.message}>
                <Input id="address" {...register('address')} />
              </FormField>

              <FormField label="Contact phone (optional)" htmlFor="contact_phone" error={errors.contact_phone?.message}>
                <Input id="contact_phone" {...register('contact_phone')} />
              </FormField>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Your administrator account
                </p>

                <div className="space-y-4">
                  <FormField label="Full name" htmlFor="admin_name" error={errors.admin_name?.message}>
                    <Input id="admin_name" autoComplete="name" {...register('admin_name')} />
                  </FormField>

                  <FormField label="Email address" htmlFor="admin_email" error={errors.admin_email?.message}>
                    <Input id="admin_email" type="email" autoComplete="email" {...register('admin_email')} />
                  </FormField>

                  <FormField label="Password" htmlFor="admin_password" error={errors.admin_password?.message}>
                    <PasswordInput id="admin_password" autoComplete="new-password" {...register('admin_password')} />
                  </FormField>
                </div>
              </div>

              {serverError && (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Submit for approval
              </Button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
