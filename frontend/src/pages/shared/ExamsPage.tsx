import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { examsApi } from '@/api/scheduling'
import { schoolClassesApi, subjectsApi, academicTermsApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export function ExamsPage() {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin') || hasRole('teacher')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subject_id: '',
    school_class_id: '',
    academic_term_id: '',
    exam_date: '',
    start_time: '09:00',
    end_time: '10:00',
    venue: '',
  })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['exams'], queryFn: () => examsApi.list() })
  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list, enabled: canManage })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list, enabled: canManage })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list, enabled: canManage })

  const createMutation = useMutation({
    mutationFn: () =>
      examsApi.create({
        title: form.title,
        subject_id: Number(form.subject_id),
        school_class_id: Number(form.school_class_id),
        academic_term_id: Number(form.academic_term_id),
        exam_date: form.exam_date,
        start_time: form.start_time,
        end_time: form.end_time,
        venue: form.venue || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      setOpen(false)
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => examsApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  })

  return (
    <div>
      <PageHeader
        title="Examinations"
        description="Scheduled examinations"
        action={canManage ? <Button onClick={() => setOpen(true)}>Schedule exam</Button> : undefined}
      />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(e) => e.id}
        emptyTitle="No examinations scheduled yet"
        columns={[
          { header: 'Title', cell: (e) => e.title },
          { header: 'Subject', cell: (e) => e.subject?.name },
          { header: 'Class', cell: (e) => e.school_class?.name },
          { header: 'Date', cell: (e) => formatDate(e.exam_date) },
          { header: 'Time', cell: (e) => `${e.start_time} – ${e.end_time}` },
          { header: 'Venue', cell: (e) => e.venue ?? '—' },
          {
            header: 'Status',
            cell: (e) =>
              e.is_published ? (
                <Badge tone="success">Published</Badge>
              ) : canManage ? (
                <Button size="sm" variant="ghost" isLoading={publishMutation.isPending} onClick={() => publishMutation.mutate(e.id)}>
                  Publish
                </Button>
              ) : (
                <Badge tone="neutral">Draft</Badge>
              ),
          },
        ]}
      />

      <Modal open={open} title="Schedule an examination" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <FormField label="Title" htmlFor="exam_title">
            <Input id="exam_title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <Select value={form.academic_term_id} onChange={(e) => setForm({ ...form, academic_term_id: e.target.value })}>
            <option value="">Term…</option>
            {terms?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
            <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <FormField label="Venue (optional)" htmlFor="exam_venue">
            <Input id="exam_venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </FormField>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!form.title || !form.school_class_id || !form.subject_id || !form.academic_term_id || !form.exam_date}
              onClick={async () => {
                setError(null)
                try {
                  await createMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
