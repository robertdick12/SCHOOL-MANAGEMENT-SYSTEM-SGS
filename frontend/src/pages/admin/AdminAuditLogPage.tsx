import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '@/api/admin'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'

const actionTone = { created: 'success', updated: 'info', deleted: 'danger' } as const

export function AdminAuditLogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['audit-logs'], queryFn: () => auditLogApi.list() })

  return (
    <div>
      <PageHeader title="Audit log" description="Changes to financial records and assessment results" />

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(l) => l.id}
        emptyTitle="No audited changes yet"
        columns={[
          { header: 'When', cell: (l) => formatDateTime(l.created_at) },
          { header: 'Who', cell: (l) => l.user?.name ?? 'System' },
          { header: 'Action', cell: (l) => <Badge tone={actionTone[l.action as keyof typeof actionTone] ?? 'neutral'}>{l.action}</Badge> },
          { header: 'Record', cell: (l) => `${l.auditable_type.split('\\').pop()} #${l.auditable_id}` },
        ]}
      />
    </div>
  )
}
