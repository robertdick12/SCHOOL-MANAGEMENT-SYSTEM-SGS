import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformSchoolsApi } from '@/api/platform'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { SchoolStatus } from '@/types/auth'
import { useState } from 'react'

const statusTone: Record<SchoolStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
}

export function PlatformSchoolsPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['platform', 'schools'], queryFn: platformSchoolsApi.list })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: SchoolStatus }) => platformSchoolsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform', 'schools'] }),
    onError: (e) => setError(extractErrorMessage(e)),
  })

  return (
    <div>
      <PageHeader
        title="Schools"
        description="Approve new sign-ups and manage which schools have active access"
      />

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(s) => s.id}
        emptyTitle="No schools have registered yet"
        columns={[
          {
            header: 'School',
            cell: (s) => (
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{s.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.contact_email}</p>
              </div>
            ),
          },
          { header: 'Contact', cell: (s) => s.contact_name },
          { header: 'Users', cell: (s) => s.users_count },
          { header: 'Registered', cell: (s) => formatDate(s.created_at) },
          { header: 'Status', cell: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge> },
          {
            header: 'Actions',
            cell: (s) => (
              <div className="flex gap-2">
                {s.status !== 'active' && (
                  <Button
                    size="sm"
                    isLoading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: s.id, status: 'active' })}
                  >
                    Approve
                  </Button>
                )}
                {s.status !== 'suspended' && (
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: s.id, status: 'suspended' })}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
