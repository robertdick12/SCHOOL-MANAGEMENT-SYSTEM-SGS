import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentsApi, enrolmentsApi } from '@/api/people'
import { schoolClassesApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

export function AdminStudentDetailPage() {
  const { studentId } = useParams()
  const id = Number(studentId)
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(id),
  })

  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })

  const enrolMutation = useMutation({
    mutationFn: (schoolClassId: number) => {
      const cls = classes?.find((c) => c.id === schoolClassId)
      if (!cls) throw new Error('Class not found')
      return enrolmentsApi.create({
        student_id: id,
        school_class_id: schoolClassId,
        academic_year_id: cls.academic_year_id,
        enrolled_at: new Date().toISOString().slice(0, 10),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students', id] }),
  })

  if (isLoading || !student) return <PageSpinner />

  const currentEnrolment = student.enrolments?.[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${student.first_name} ${student.last_name}`}
        description={`Admission #${student.admission_number}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <Badge tone={student.status === 'active' ? 'success' : 'neutral'}>{student.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Gender</span>
              <span>{student.gender ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date of birth</span>
              <span>{student.date_of_birth ? formatDate(student.date_of_birth) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Admitted</span>
              <span>{formatDate(student.admission_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Portal account</span>
              <span>{student.user_id ? 'Active' : 'Not set up'}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Class enrolment" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current class</span>
              <span className="font-medium">{currentEnrolment?.school_class?.name ?? 'Not enrolled'}</span>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="">Select a class…</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academic_year?.name})
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                size="sm"
                isLoading={enrolMutation.isPending}
                disabled={!selectedClass}
                onClick={async () => {
                  setError(null)
                  try {
                    await enrolMutation.mutateAsync(Number(selectedClass))
                  } catch (e) {
                    setError(extractErrorMessage(e))
                  }
                }}
              >
                Enrol
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Guardians" description="Linked via the Guardians page" />
          <CardBody>
            {student.guardians && student.guardians.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {student.guardians.map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {g.first_name} {g.last_name} — {g.phone}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No guardians linked yet. Link one from the Guardians page.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
