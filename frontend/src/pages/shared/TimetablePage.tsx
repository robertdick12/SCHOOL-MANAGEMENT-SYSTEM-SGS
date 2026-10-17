import { useQuery } from '@tanstack/react-query'
import { timetableApi } from '@/api/scheduling'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function TimetablePage() {
  const { data, isLoading } = useQuery({ queryKey: ['timetable-entries'], queryFn: () => timetableApi.list() })

  return (
    <div>
      <PageHeader title="Timetable" description="Weekly schedule" />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No timetable entries yet" />
      ) : (
        <div className="space-y-6">
          {DAYS.map((label, index) => {
            const dayNumber = index + 1
            const entries = data
              .filter((e) => e.day_of_week === dayNumber)
              .sort((a, b) => a.start_time.localeCompare(b.start_time))

            if (entries.length === 0) return null

            return (
              <div key={label}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
                <Card>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {entries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{entry.subject?.name}</p>
                          <p className="text-slate-500 dark:text-slate-400">
                            {entry.school_class?.name} · {entry.teacher?.user?.name}
                            {entry.room ? ` · Room ${entry.room}` : ''}
                          </p>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400">
                          {entry.start_time} – {entry.end_time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
