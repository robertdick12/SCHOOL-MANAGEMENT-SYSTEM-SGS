import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

export function TeacherOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'teacher'], queryFn: dashboardApi.teacher })

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        description={`Teacher overview — ${formatDate(new Date())}`}
      />

      {isLoading || !data ? (
        <PageSpinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="My classes" value={data.class_count} />
            <StatTile label="Today's lessons" value={data.todays_lessons.length} />
            <StatTile label="Unpublished assessments" value={data.unpublished_assessments} tone="warning" />
          </div>

          <Card>
            <CardHeader title="Today's lessons" />
            {data.todays_lessons.length === 0 ? (
              <EmptyState title="No lessons scheduled for today" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.todays_lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>
                      {lesson.subject.name} — {lesson.school_class.name}
                    </span>
                    <span className="text-slate-500">
                      {lesson.start_time} – {lesson.end_time}
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
