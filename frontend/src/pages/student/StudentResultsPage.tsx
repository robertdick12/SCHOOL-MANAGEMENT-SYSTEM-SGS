import { useQuery } from '@tanstack/react-query'
import { resultsApi } from '@/api/assessments'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'

export function StudentResultsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['results', 'mine'], queryFn: resultsApi.mine })

  return (
    <div>
      <PageHeader title="My results" description="Published assessment results" />
      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(r) => r.id}
        emptyTitle="No published results yet"
        emptyDescription="Results appear here once your teacher publishes them."
        columns={[
          { header: 'Subject', cell: (r) => r.subject },
          { header: 'Assessment', cell: (r) => r.assessment },
          { header: 'Type', cell: (r) => r.type },
          { header: 'Score', cell: (r) => (r.score !== null ? `${r.score} / ${r.max_score}` : 'Not graded') },
          { header: 'Remarks', cell: (r) => r.remarks ?? '—' },
        ]}
      />
    </div>
  )
}
