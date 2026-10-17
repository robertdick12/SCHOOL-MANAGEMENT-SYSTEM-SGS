import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { studentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const schema = z.object({
  admission_number: z.string().min(1, 'Required'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  admission_date: z.string().min(1, 'Required'),
})
type FormValues = z.infer<typeof schema>

export function AdminStudentsPage() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['students', { search }],
    queryFn: () => studentsApi.list({ search: search || undefined }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => studentsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setOpen(false)
      reset()
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
        title="Students"
        description="All registered students"
        action={<Button onClick={() => setOpen(true)}>Register student</Button>}
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by name or admission number…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(s) => s.id}
        emptyTitle="No students yet"
        emptyDescription="Register your first student to get started."
        columns={[
          {
            header: 'Name',
            cell: (s) => (
              <Link to={`/admin/students/${s.id}`} className="font-medium text-brand-700 hover:underline">
                {s.first_name} {s.last_name}
              </Link>
            ),
          },
          { header: 'Admission #', cell: (s) => s.admission_number },
          { header: 'Class', cell: (s) => s.enrolments?.[0]?.school_class?.name ?? '—' },
          { header: 'Admitted', cell: (s) => formatDate(s.admission_date) },
          {
            header: 'Status',
            cell: (s) => (
              <Badge tone={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge>
            ),
          },
        ]}
      />

      <Modal open={open} title="Register a student" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="first_name" error={errors.first_name?.message}>
              <Input id="first_name" {...register('first_name')} />
            </FormField>
            <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
              <Input id="last_name" {...register('last_name')} />
            </FormField>
          </div>
          <FormField label="Admission number" htmlFor="admission_number" error={errors.admission_number?.message}>
            <Input id="admission_number" {...register('admission_number')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of birth" htmlFor="date_of_birth" error={errors.date_of_birth?.message}>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </FormField>
            <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
              <Select id="gender" {...register('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Admission date" htmlFor="admission_date" error={errors.admission_date?.message}>
            <Input id="admission_date" type="date" {...register('admission_date')} />
          </FormField>

          {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
