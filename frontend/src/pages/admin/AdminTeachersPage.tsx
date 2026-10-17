import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { teachersApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  staff_number: z.string().min(1, 'Required'),
  qualification: z.string().optional(),
  hire_date: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function AdminTeachersPage() {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.list })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => teachersApi.create(values),
    onSuccess: (teacher) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setOpen(false)
      reset()
      if (teacher.temporary_password) {
        setCreatedCredential({ email: teacher.user!.email, password: teacher.temporary_password })
      }
    },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await createMutation.mutateAsync(values)
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Teaching staff and their portal accounts"
        action={<Button onClick={() => setOpen(true)}>Add teacher</Button>}
      />

      {createdCredential && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Account created for <strong>{createdCredential.email}</strong>. Temporary password:{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">{createdCredential.password}</code>. Share this
          securely — it will not be shown again.
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(t) => t.id}
        emptyTitle="No teachers yet"
        columns={[
          { header: 'Name', cell: (t) => t.user?.name },
          { header: 'Email', cell: (t) => t.user?.email },
          { header: 'Staff #', cell: (t) => t.staff_number },
          { header: 'Hired', cell: (t) => (t.hire_date ? formatDate(t.hire_date) : '—') },
          { header: 'Status', cell: (t) => <Badge tone={t.status === 'active' ? 'success' : 'neutral'}>{t.status}</Badge> },
        ]}
      />

      <Modal open={open} title="Add a teacher" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register('name')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register('email')} />
          </FormField>
          <FormField label="Staff number" htmlFor="staff_number" error={errors.staff_number?.message}>
            <Input id="staff_number" {...register('staff_number')} />
          </FormField>
          <FormField label="Qualification" htmlFor="qualification" error={errors.qualification?.message}>
            <Input id="qualification" {...register('qualification')} />
          </FormField>
          <FormField label="Hire date" htmlFor="hire_date" error={errors.hire_date?.message}>
            <Input id="hire_date" type="date" {...register('hire_date')} />
          </FormField>

          {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
