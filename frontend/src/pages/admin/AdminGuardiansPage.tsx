import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { guardiansApi, studentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'

const guardianSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
})
type GuardianForm = z.infer<typeof guardianSchema>

export function AdminGuardiansPage() {
  const [open, setOpen] = useState(false)
  const [linkingGuardianId, setLinkingGuardianId] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['guardians'], queryFn: () => guardiansApi.list() })
  const { data: studentsData } = useQuery({ queryKey: ['students', 'all-for-link'], queryFn: () => studentsApi.list({ per_page: 200 }) })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianForm>({ resolver: zodResolver(guardianSchema) })

  const createMutation = useMutation({
    mutationFn: (values: GuardianForm) => guardiansApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] })
      setOpen(false)
      reset()
    },
  })

  const linkMutation = useMutation({
    mutationFn: ({ studentId, relationship }: { studentId: number; relationship: string }) =>
      guardiansApi.linkStudent(linkingGuardianId!, studentId, relationship, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] })
      setLinkingGuardianId(null)
    },
  })

  const onSubmit = async (values: GuardianForm) => {
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
        title="Guardians"
        description="Parents and guardians, and the children linked to them"
        action={<Button onClick={() => setOpen(true)}>Add guardian</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(g) => g.id}
        emptyTitle="No guardians yet"
        columns={[
          { header: 'Name', cell: (g) => `${g.first_name} ${g.last_name}` },
          { header: 'Phone', cell: (g) => g.phone },
          { header: 'Email', cell: (g) => g.email ?? '—' },
          { header: 'Linked children', cell: (g) => g.students?.length ?? 0 },
          {
            header: '',
            cell: (g) => (
              <Button size="sm" variant="secondary" onClick={() => setLinkingGuardianId(g.id)}>
                Link child
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} title="Add a guardian" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="g_first_name" error={errors.first_name?.message}>
              <Input id="g_first_name" {...register('first_name')} />
            </FormField>
            <FormField label="Last name" htmlFor="g_last_name" error={errors.last_name?.message}>
              <Input id="g_last_name" {...register('last_name')} />
            </FormField>
          </div>
          <FormField label="Phone" htmlFor="g_phone" error={errors.phone?.message}>
            <Input id="g_phone" {...register('phone')} />
          </FormField>
          <FormField label="Email (optional)" htmlFor="g_email" error={errors.email?.message}>
            <Input id="g_email" type="email" {...register('email')} />
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

      <Modal open={linkingGuardianId !== null} title="Link a child" onClose={() => setLinkingGuardianId(null)}>
        <LinkChildForm
          students={studentsData?.data ?? []}
          isLoading={linkMutation.isPending}
          onCancel={() => setLinkingGuardianId(null)}
          onSubmit={(studentId, relationship) => linkMutation.mutate({ studentId, relationship })}
        />
      </Modal>
    </div>
  )
}

function LinkChildForm({
  students,
  isLoading,
  onCancel,
  onSubmit,
}: {
  students: { id: number; first_name: string; last_name: string; admission_number: string }[]
  isLoading: boolean
  onCancel: () => void
  onSubmit: (studentId: number, relationship: string) => void
}) {
  const [studentId, setStudentId] = useState('')
  const [relationship, setRelationship] = useState('father')

  return (
    <div className="space-y-4">
      <FormField label="Student" htmlFor="link_student">
        <Select id="link_student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Select a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.admission_number})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Relationship" htmlFor="link_relationship">
        <Select id="link_relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="guardian">Guardian</option>
          <option value="other">Other</option>
        </Select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          isLoading={isLoading}
          disabled={!studentId}
          onClick={() => onSubmit(Number(studentId), relationship)}
        >
          Link
        </Button>
      </div>
    </div>
  )
}
