import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'

export function AdminOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin })

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        description={`Administrator overview — ${formatDate(new Date())}`}
      />

      {isLoading || !data ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Active students" value={data.student_count} />
          <StatTile label="Active teachers" value={data.teacher_count} />
          <StatTile label="Classes" value={data.class_count} />
          <StatTile
            label="Outstanding fees"
            value={formatCurrency(data.outstanding_balance_pesewas)}
            tone={data.outstanding_balance_pesewas > 0 ? 'warning' : 'good'}
          />
          <StatTile label="Collected today" value={formatCurrency(data.todays_collections_pesewas)} tone="good" />
          <StatTile label="Unpublished assessments" value={data.unpublished_assessments} tone="neutral" />
        </div>
      )}
    </div>
  )
}
