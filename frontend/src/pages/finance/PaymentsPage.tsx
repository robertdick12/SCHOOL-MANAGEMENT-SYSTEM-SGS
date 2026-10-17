import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/api/finance'
import { studentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export function PaymentsPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount_cedis: '', method: 'cash', notes: '' })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => paymentsApi.list() })
  const { data: studentsData } = useQuery({ queryKey: ['students', 'for-payment'], queryFn: () => studentsApi.list({ per_page: 200 }) })

  const recordMutation = useMutation({
    mutationFn: () =>
      paymentsApi.record({
        student_id: Number(form.student_id),
        amount_pesewas: Math.round(Number(form.amount_cedis) * 100),
        method: form.method,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setOpen(false)
      setForm({ student_id: '', amount_cedis: '', method: 'cash', notes: '' })
    },
  })

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Manually recorded payments, auto-allocated to outstanding invoices"
        action={<Button onClick={() => setOpen(true)}>Record payment</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(p) => p.id}
        emptyTitle="No payments recorded yet"
        columns={[
          { header: 'Student', cell: (p) => (p.student ? `${p.student.first_name} ${p.student.last_name}` : '—') },
          { header: 'Amount', cell: (p) => formatCurrency(p.amount_pesewas) },
          { header: 'Method', cell: (p) => p.method.replace('_', ' ') },
          { header: 'Status', cell: (p) => <Badge tone={p.status === 'verified' ? 'success' : 'warning'}>{p.status}</Badge> },
          { header: 'Date', cell: (p) => formatDateTime(p.paid_at) },
        ]}
      />

      <Modal open={open} title="Record a payment" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">Select a student…</option>
            {studentsData?.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.admission_number})
              </option>
            ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount (GHS)"
            value={form.amount_cedis}
            onChange={(e) => setForm({ ...form, amount_cedis: e.target.value })}
          />
          <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
          </Select>
          <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This is allocated automatically to the student&apos;s oldest outstanding invoices first.
          </p>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={recordMutation.isPending}
              disabled={!form.student_id || !form.amount_cedis}
              onClick={async () => {
                setError(null)
                try {
                  await recordMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Record payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
