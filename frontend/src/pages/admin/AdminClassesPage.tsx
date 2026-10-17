import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { schoolClassesApi, academicYearsApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  academic_year_id: z.string().min(1, 'Required'),
  capacity: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function AdminClassesPage() {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })
  const { data: years } = useQuery({ queryKey: ['academic-years'], queryFn: academicYearsApi.list })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      schoolClassesApi.create({
        name: values.name,
        academic_year_id: Number(values.academic_year_id),
        capacity: values.capacity ? Number(values.capacity) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-classes'] })
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
        title="Classes"
        description="Classes for the current and past academic years"
        action={<Button onClick={() => setOpen(true)}>Add class</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(c) => c.id}
        emptyTitle="No classes yet"
        columns={[
          {
            header: 'Name',
            cell: (c) => (
              <Link to={`/admin/classes/${c.id}`} className="font-medium text-brand-700 hover:underline">
                {c.name}
              </Link>
            ),
          },
          { header: 'Academic year', cell: (c) => c.academic_year?.name },
          { header: 'Class teacher', cell: (c) => c.class_teacher?.user?.name ?? '—' },
          { header: 'Capacity', cell: (c) => c.capacity ?? '—' },
        ]}
      />

      <Modal open={open} title="Add a class" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" htmlFor="class_name" error={errors.name?.message}>
            <Input id="class_name" placeholder="e.g. JHS 1A" {...register('name')} />
          </FormField>
          <FormField label="Academic year" htmlFor="class_year" error={errors.academic_year_id?.message}>
            <Select id="class_year" {...register('academic_year_id')}>
              <option value="">Select…</option>
              {years?.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Capacity (optional)" htmlFor="class_capacity" error={errors.capacity?.message}>
            <Input id="class_capacity" type="number" {...register('capacity')} />
          </FormField>

          {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{serverError}</p>}

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
