import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { feeStructuresApi } from '@/api/finance'
import { academicTermsApi, schoolClassesApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/utils'

export function FeeStructuresPage() {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    fee_type: 'tuition',
    school_class_id: '',
    academic_term_id: '',
    amount_cedis: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['fee-structures'], queryFn: () => feeStructuresApi.list() })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })
  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })

  const createMutation = useMutation({
    mutationFn: () =>
      feeStructuresApi.create({
        name: form.name,
        fee_type: form.fee_type as 'tuition' | 'transport' | 'other',
        school_class_id: form.school_class_id ? Number(form.school_class_id) : null,
        academic_term_id: Number(form.academic_term_id),
        amount_pesewas: Math.round(Number(form.amount_cedis) * 100),
        description: form.description || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] })
      setOpen(false)
      setForm({ name: '', fee_type: 'tuition', school_class_id: '', academic_term_id: '', amount_cedis: '', description: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => feeStructuresApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] })
      setDeleting(null)
    },
  })

  return (
    <div>
      <PageHeader
        title="Fee structures"
        description="Charges applied per class and term — the building blocks of student invoices"
        action={<Button onClick={() => setOpen(true)}>Add fee structure</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(f) => f.id}
        emptyTitle="No fee structures yet"
        emptyDescription="Add one before generating invoices."
        columns={[
          { header: 'Name', cell: (f) => f.name },
          { header: 'Type', cell: (f) => f.fee_type },
          { header: 'Class', cell: (f) => f.school_class?.name ?? 'All classes' },
          { header: 'Term', cell: (f) => f.academic_term?.name },
          { header: 'Amount', cell: (f) => formatCurrency(f.amount_pesewas) },
          {
            header: '',
            cell: (f) => (
              <Button size="sm" variant="ghost" onClick={() => setDeleting(f.id)}>
                Delete
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} title="Add a fee structure" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <FormField label="Name" htmlFor="fs_name">
            <Input id="fs_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tuition - Term 1" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" htmlFor="fs_type">
              <Select id="fs_type" value={form.fee_type} onChange={(e) => setForm({ ...form, fee_type: e.target.value })}>
                <option value="tuition">Tuition</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Amount (GHS)" htmlFor="fs_amount">
              <Input id="fs_amount" type="number" step="0.01" value={form.amount_cedis} onChange={(e) => setForm({ ...form, amount_cedis: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Class (optional — blank = school-wide)" htmlFor="fs_class">
              <Select id="fs_class" value={form.school_class_id} onChange={(e) => setForm({ ...form, school_class_id: e.target.value })}>
                <option value="">All classes</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Term" htmlFor="fs_term">
              <Select id="fs_term" value={form.academic_term_id} onChange={(e) => setForm({ ...form, academic_term_id: e.target.value })}>
                <option value="">Select…</option>
                {terms?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.academic_year?.name})
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Description (optional)" htmlFor="fs_description">
            <Input id="fs_description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!form.name || !form.academic_term_id || !form.amount_cedis}
              onClick={async () => {
                setError(null)
                try {
                  await createMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this fee structure?"
        description="This cannot be undone. Invoices already generated from it are not affected."
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </div>
  )
}
