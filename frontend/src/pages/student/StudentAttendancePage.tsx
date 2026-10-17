import { useQuery } from '@tanstack/react-query'
import { attendanceApi } from '@/api/assessments'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const tone = { present: 'success', late: 'warning', excused: 'info', absent: 'danger' } as const

export function StudentAttendancePage() {
  const { data, isLoading } = useQuery({ queryKey: ['attendance', 'mine'], queryFn: attendanceApi.mine })

  return (
    <div>
      <PageHeader title="My attendance" description="Last 90 days" />
      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(r) => r.date}
        emptyTitle="No attendance records yet"
        columns={[
          { header: 'Date', cell: (r) => formatDate(r.date) },
          { header: 'Status', cell: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge> },
          { header: 'Remarks', cell: (r) => r.remarks ?? '—' },
        ]}
      />
    </div>
  )
}
