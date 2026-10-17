import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/admin'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <div>
      <PageHeader title="Users & roles" description="Everyone with a portal account" />

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(u) => u.id}
        emptyTitle="No users yet"
        columns={[
          { header: 'Name', cell: (u) => u.name },
          { header: 'Email', cell: (u) => u.email },
          {
            header: 'Roles',
            cell: (u) => (
              <div className="flex gap-1">
                {u.roles.map((r) => (
                  <Badge key={r.id} tone="info">
                    {r.name}
                  </Badge>
                ))}
              </div>
            ),
          },
          { header: 'Status', cell: (u) => <Badge tone={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Deactivated'}</Badge> },
          {
            header: '',
            cell: (u) => (
              <Button size="sm" variant="ghost" isLoading={toggleMutation.isPending} onClick={() => toggleMutation.mutate(u.id)}>
                {u.is_active ? 'Deactivate' : 'Reactivate'}
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
