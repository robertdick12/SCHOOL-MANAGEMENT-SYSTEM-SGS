import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

export function StudentOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'student'], queryFn: dashboardApi.student })

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        description={`Student overview — ${formatDate(new Date())}`}
      />

      {isLoading || !data ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatTile label="Current class" value={data.current_class ?? 'Not enrolled'} />
          <StatTile
            label="Attendance rate (this term)"
            value={data.attendance_rate !== null ? `${data.attendance_rate}%` : '—'}
            tone={data.attendance_rate !== null && data.attendance_rate < 75 ? 'warning' : 'good'}
          />
          <StatTile label="Published results" value={data.published_results_count} />
        </div>
      )}
    </div>
  )
}
