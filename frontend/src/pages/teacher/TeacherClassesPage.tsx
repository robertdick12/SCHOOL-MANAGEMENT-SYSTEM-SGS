import { useQuery } from '@tanstack/react-query'
import { schoolClassesApi } from '@/api/academics'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'

export function TeacherClassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })

  return (
    <div>
      <PageHeader title="My classes" description="Classes you teach or are the class teacher for" />
      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(c) => c.id}
        emptyTitle="No classes assigned yet"
        columns={[
          { header: 'Class', cell: (c) => c.name },
          { header: 'Academic year', cell: (c) => c.academic_year?.name },
          { header: 'Capacity', cell: (c) => c.capacity ?? '—' },
        ]}
      />
    </div>
  )
}
