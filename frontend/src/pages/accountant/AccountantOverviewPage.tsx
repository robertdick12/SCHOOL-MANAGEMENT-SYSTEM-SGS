import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

export function AccountantOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'accountant'], queryFn: dashboardApi.accountant })

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        description={`Accountant overview — ${formatDate(new Date())}`}
      />

      {isLoading || !data ? (
        <PageSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Outstanding balance" value={formatCurrency(data.outstanding_balance_pesewas)} tone="warning" />
            <StatTile label="Collected today" value={formatCurrency(data.todays_collections_pesewas)} tone="good" />
            <StatTile label="Unpaid invoices" value={data.unpaid_invoice_count} />
          </div>

          <Card>
            <CardHeader title="Recent payments" />
            {data.recent_payments.length === 0 ? (
              <EmptyState title="No payments recorded yet" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recent_payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>
                      {p.student.first_name} {p.student.last_name}
                    </span>
                    <span className="flex gap-3 text-slate-500">
                      <span className="font-medium text-slate-900">{formatCurrency(p.amount_pesewas)}</span>
                      {formatDateTime(p.paid_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
