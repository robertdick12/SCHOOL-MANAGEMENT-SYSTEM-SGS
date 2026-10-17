import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/api/finance'
import { academicTermsApi } from '@/api/academics'
import { studentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/models'

const statusTone: Record<Invoice['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
  cancelled: 'neutral',
}

export function InvoicesPage() {
  const [open, setOpen] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [termId, setTermId] = useState('')
  const [viewing, setViewing] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => invoicesApi.list() })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })
  const { data: studentsData } = useQuery({ queryKey: ['students', 'for-invoice'], queryFn: () => studentsApi.list({ per_page: 200 }) })

  const generateMutation = useMutation({
    mutationFn: () => invoicesApi.generate(Number(studentId), Number(termId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setOpen(false)
      setStudentId('')
      setTermId('')
    },
  })

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Generated from fee structures for a student's class and term"
        action={<Button onClick={() => setOpen(true)}>Generate invoice</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(i) => i.id}
        emptyTitle="No invoices yet"
        columns={[
          { header: 'Invoice #', cell: (i) => i.invoice_number },
          { header: 'Student', cell: (i) => (i.student ? `${i.student.first_name} ${i.student.last_name}` : '—') },
          { header: 'Total', cell: (i) => formatCurrency(i.total_amount_pesewas) },
          { header: 'Paid', cell: (i) => formatCurrency(i.amount_paid_pesewas) },
          { header: 'Outstanding', cell: (i) => formatCurrency(i.total_amount_pesewas - i.amount_paid_pesewas) },
          { header: 'Status', cell: (i) => <Badge tone={statusTone[i.status]}>{i.status}</Badge> },
          { header: 'Issued', cell: (i) => formatDate(i.issued_at) },
          {
            header: '',
            cell: (i) => (
              <Button size="sm" variant="secondary" onClick={() => setViewing(i)}>
                View
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} title="Generate an invoice" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select a student…</option>
            {studentsData?.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.admission_number})
              </option>
            ))}
          </Select>
          <Select value={termId} onChange={(e) => setTermId(e.target.value)}>
            <option value="">Select a term…</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.academic_year?.name})
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={generateMutation.isPending}
              disabled={!studentId || !termId}
              onClick={async () => {
                setError(null)
                try {
                  await generateMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Generate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={viewing !== null} title={`Invoice ${viewing?.invoice_number ?? ''}`} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {viewing.items?.map((item) => (
                <li key={item.id} className="flex justify-between py-2">
                  <span>{item.description}</span>
                  <span>{formatCurrency(item.amount_pesewas)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-medium dark:border-slate-800">
              <span>Total</span>
              <span>{formatCurrency(viewing.total_amount_pesewas)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Paid</span>
              <span>{formatCurrency(viewing.amount_paid_pesewas)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Outstanding</span>
              <span>{formatCurrency(viewing.total_amount_pesewas - viewing.amount_paid_pesewas)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
