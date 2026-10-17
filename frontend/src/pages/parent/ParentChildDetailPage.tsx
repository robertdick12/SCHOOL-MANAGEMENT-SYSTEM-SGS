import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { resultsApi, attendanceApi } from '@/api/assessments'
import { invoicesApi, paymentsApi } from '@/api/finance'
import { studentsApi } from '@/api/people'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import type { Invoice } from '@/types/models'

const TABS = ['Results', 'Attendance', 'Invoices', 'Payments'] as const
type Tab = (typeof TABS)[number]

const invoiceTone: Record<Invoice['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
  cancelled: 'neutral',
}

export function ParentChildDetailPage() {
  const { studentId } = useParams()
  const id = Number(studentId)
  const [tab, setTab] = useState<Tab>('Results')

  const { data: student } = useQuery({ queryKey: ['students', id], queryFn: () => studentsApi.get(id) })
  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['results', id],
    queryFn: () => resultsApi.forStudent(id),
    enabled: tab === 'Results',
  })
  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.forStudent(id),
    enabled: tab === 'Attendance',
  })
  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', { student_id: id }],
    queryFn: () => invoicesApi.list({ student_id: id }),
    enabled: tab === 'Invoices',
  })
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', { student_id: id }],
    queryFn: () => paymentsApi.list({ student_id: id }),
    enabled: tab === 'Payments',
  })

  return (
    <div>
      <PageHeader title={student ? `${student.first_name} ${student.last_name}` : 'Child'} description={student?.admission_number} />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'focus-ring -mb-px border-b-2 px-3 py-2 text-sm font-medium',
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Results' && (
        <DataTable
          isLoading={loadingResults}
          rows={results}
          rowKey={(r) => r.id}
          emptyTitle="No published results yet"
          columns={[
            { header: 'Subject', cell: (r) => r.subject },
            { header: 'Assessment', cell: (r) => r.assessment },
            { header: 'Score', cell: (r) => (r.score !== null ? `${r.score} / ${r.max_score}` : 'Not graded') },
          ]}
        />
      )}

      {tab === 'Attendance' && (
        <DataTable
          isLoading={loadingAttendance}
          rows={attendance}
          rowKey={(a) => a.date}
          emptyTitle="No attendance records yet"
          columns={[
            { header: 'Date', cell: (a) => formatDate(a.date) },
            { header: 'Status', cell: (a) => <Badge tone={a.status === 'present' ? 'success' : 'warning'}>{a.status}</Badge> },
          ]}
        />
      )}

      {tab === 'Invoices' && (
        <DataTable
          isLoading={loadingInvoices}
          rows={invoices?.data}
          rowKey={(i) => i.id}
          emptyTitle="No invoices yet"
          columns={[
            { header: 'Invoice #', cell: (i) => i.invoice_number },
            { header: 'Total', cell: (i) => formatCurrency(i.total_amount_pesewas) },
            { header: 'Outstanding', cell: (i) => formatCurrency(i.total_amount_pesewas - i.amount_paid_pesewas) },
            { header: 'Status', cell: (i) => <Badge tone={invoiceTone[i.status]}>{i.status}</Badge> },
          ]}
        />
      )}

      {tab === 'Payments' && (
        <DataTable
          isLoading={loadingPayments}
          rows={payments?.data}
          rowKey={(p) => p.id}
          emptyTitle="No payments yet"
          columns={[
            { header: 'Amount', cell: (p) => formatCurrency(p.amount_pesewas) },
            { header: 'Method', cell: (p) => p.method.replace('_', ' ') },
            { header: 'Status', cell: (p) => <Badge tone={p.status === 'verified' ? 'success' : 'warning'}>{p.status}</Badge> },
            { header: 'Date', cell: (p) => formatDateTime(p.paid_at) },
          ]}
        />
      )}
    </div>
  )
}
