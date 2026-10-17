import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentsApi } from '@/api/assessments'
import { schoolClassesApi, subjectsApi, academicTermsApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export function TeacherAssessmentsPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'quiz',
    school_class_id: '',
    subject_id: '',
    academic_term_id: '',
    max_score: '100',
  })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['assessments'], queryFn: () => assessmentsApi.list() })
  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })

  const createMutation = useMutation({
    mutationFn: () =>
      assessmentsApi.create({
        name: form.name,
        type: form.type as 'quiz' | 'exam' | 'homework' | 'project' | 'other',
        school_class_id: Number(form.school_class_id),
        subject_id: Number(form.subject_id),
        academic_term_id: Number(form.academic_term_id),
        max_score: form.max_score,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      setOpen(false)
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => assessmentsApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessments'] }),
  })

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Quizzes, exams, and other graded work for your classes"
        action={<Button onClick={() => setOpen(true)}>New assessment</Button>}
      />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(a) => a.id}
        emptyTitle="No assessments yet"
        columns={[
          { header: 'Name', cell: (a) => <Link to={`/teacher/assessments/${a.id}`} className="font-medium text-brand-700 hover:underline">{a.name}</Link> },
          { header: 'Subject', cell: (a) => a.subject?.name },
          { header: 'Class', cell: (a) => a.school_class?.name },
          { header: 'Max score', cell: (a) => a.max_score },
          {
            header: 'Status',
            cell: (a) =>
              a.is_published ? (
                <Badge tone="success">Published</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">Draft</Badge>
                  <Button size="sm" variant="ghost" isLoading={publishMutation.isPending} onClick={() => publishMutation.mutate(a.id)}>
                    Publish
                  </Button>
                </div>
              ),
          },
        ]}
      />

      <Modal open={open} title="New assessment" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Input placeholder="Name e.g. Mid-term Exam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="homework">Homework</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </Select>
            <Input type="number" placeholder="Max score" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} />
          </div>
          <Select value={form.school_class_id} onChange={(e) => setForm({ ...form, school_class_id: e.target.value })}>
            <option value="">Class…</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
            <option value="">Subject…</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select value={form.academic_term_id} onChange={(e) => setForm({ ...form, academic_term_id: e.target.value })}>
            <option value="">Term…</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!form.name || !form.school_class_id || !form.subject_id || !form.academic_term_id}
              onClick={async () => {
                setError(null)
                try {
                  await createMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
