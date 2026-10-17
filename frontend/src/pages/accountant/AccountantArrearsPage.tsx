import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/api/finance'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export function AccountantArrearsPage() {
  const { data: unpaid, isLoading: l1 } = useQuery({
    queryKey: ['invoices', { status: 'unpaid' }],
    queryFn: () => invoicesApi.list({ status: 'unpaid', per_page: 100 }),
  })
  const { data: partial, isLoading: l2 } = useQuery({
    queryKey: ['invoices', { status: 'partial' }],
    queryFn: () => invoicesApi.list({ status: 'partial', per_page: 100 }),
  })

  const rows = [...(unpaid?.data ?? []), ...(partial?.data ?? [])].sort(
    (a, b) => b.total_amount_pesewas - b.amount_paid_pesewas - (a.total_amount_pesewas - a.amount_paid_pesewas),
  )

  const totalOutstanding = rows.reduce((sum, i) => sum + (i.total_amount_pesewas - i.amount_paid_pesewas), 0)

  return (
    <div>
      <PageHeader title="Arrears report" description={`Total outstanding: ${formatCurrency(totalOutstanding)}`} />

      <DataTable
        isLoading={l1 || l2}
        rows={rows}
        rowKey={(i) => i.id}
        emptyTitle="No outstanding balances — everything is paid up"
        columns={[
          { header: 'Invoice #', cell: (i) => i.invoice_number },
          { header: 'Student', cell: (i) => (i.student ? `${i.student.first_name} ${i.student.last_name}` : '—') },
          { header: 'Outstanding', cell: (i) => formatCurrency(i.total_amount_pesewas - i.amount_paid_pesewas) },
          { header: 'Due', cell: (i) => (i.due_date ? formatDate(i.due_date) : '—') },
          { header: 'Status', cell: (i) => <Badge tone={i.status === 'unpaid' ? 'danger' : 'warning'}>{i.status}</Badge> },
        ]}
      />
    </div>
  )
}
