import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolClassesApi } from '@/api/academics'
import { teacherAssignmentsApi, teachersApi } from '@/api/people'
import { subjectsApi, academicTermsApi } from '@/api/academics'
import { studentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function AdminClassDetailPage() {
  const { classId } = useParams()
  const id = Number(classId)
  const queryClient = useQueryClient()
  const [teacherId, setTeacherId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [termId, setTermId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: schoolClass, isLoading } = useQuery({ queryKey: ['school-classes', id], queryFn: () => schoolClassesApi.get(id) })
  const { data: assignments } = useQuery({ queryKey: ['teacher-assignments', id], queryFn: () => teacherAssignmentsApi.list(id) })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.list })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })
  const { data: students } = useQuery({
    queryKey: ['students', { school_class_id: id }],
    queryFn: () => studentsApi.list({ school_class_id: id, per_page: 100 }),
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      teacherAssignmentsApi.create({
        teacher_id: Number(teacherId),
        school_class_id: id,
        subject_id: Number(subjectId),
        academic_term_id: Number(termId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments', id] })
      setTeacherId('')
      setSubjectId('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (assignmentId: number) => teacherAssignmentsApi.remove(assignmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-assignments', id] }),
  })

  if (isLoading || !schoolClass) return <PageSpinner />

  return (
    <div className="space-y-6">
      <PageHeader title={schoolClass.name} description={schoolClass.academic_year?.name} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Subject teachers" description="Who teaches what in this class" />
          <CardBody className="space-y-4">
            {assignments && assignments.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      <span className="font-medium">{a.subject?.name}</span> — {a.teacher?.user?.name}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => removeMutation.mutate(a.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No subject teachers assigned yet.</p>
            )}

            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">Subject…</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  <option value="">Teacher…</option>
                  {teachers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name}
                    </option>
                  ))}
                </Select>
                <Select value={termId} onChange={(e) => setTermId(e.target.value)}>
                  <option value="">Term…</option>
                  {terms?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button
                size="sm"
                isLoading={assignMutation.isPending}
                disabled={!teacherId || !subjectId || !termId}
                onClick={async () => {
                  setError(null)
                  try {
                    await assignMutation.mutateAsync()
                  } catch (e) {
                    setError(extractErrorMessage(e))
                  }
                }}
              >
                Assign
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Students" description={`${students?.data.length ?? 0} enrolled`} />
          <CardBody>
            {students && students.data.length > 0 ? (
              <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {students.data.map((s) => (
                  <li key={s.id} className="py-2">
                    {s.first_name} {s.last_name} <span className="text-slate-400 dark:text-slate-500">({s.admission_number})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No students enrolled yet" />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
