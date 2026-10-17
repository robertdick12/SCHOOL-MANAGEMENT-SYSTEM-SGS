import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { timetableApi } from '@/api/scheduling'
import { schoolClassesApi, subjectsApi, academicTermsApi } from '@/api/academics'
import { teacherAssignmentsApi } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Select, Input } from '@/components/ui/Input'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function AdminTimetablePage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    school_class_id: '',
    subject_id: '',
    teacher_id: '',
    academic_term_id: '',
    day_of_week: '1',
    start_time: '08:00',
    end_time: '09:00',
    room: '',
  })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['timetable-entries'], queryFn: () => timetableApi.list() })
  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })
  const { data: assignments } = useQuery({
    queryKey: ['teacher-assignments', form.school_class_id],
    queryFn: () => teacherAssignmentsApi.list(Number(form.school_class_id)),
    enabled: !!form.school_class_id,
  })

  const availableTeachers = assignments?.filter((a) => String(a.subject_id) === form.subject_id) ?? []

  const createMutation = useMutation({
    mutationFn: () =>
      timetableApi.create({
        school_class_id: Number(form.school_class_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        academic_term_id: Number(form.academic_term_id),
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-entries'] })
      setOpen(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => timetableApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable-entries'] }),
  })

  return (
    <div>
      <PageHeader title="Timetable" description="School-wide lesson schedule" action={<Button onClick={() => setOpen(true)}>Add lesson</Button>} />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(e) => e.id}
        emptyTitle="No timetable entries yet"
        columns={[
          { header: 'Day', cell: (e) => DAY_LABELS[e.day_of_week - 1] },
          { header: 'Time', cell: (e) => `${e.start_time} – ${e.end_time}` },
          { header: 'Class', cell: (e) => e.school_class?.name },
          { header: 'Subject', cell: (e) => e.subject?.name },
          { header: 'Teacher', cell: (e) => e.teacher?.user?.name },
          { header: 'Room', cell: (e) => e.room ?? '—' },
          {
            header: '',
            cell: (e) => (
              <Button size="sm" variant="ghost" onClick={() => removeMutation.mutate(e.id)}>
                Remove
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} title="Add a timetable lesson" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={form.school_class_id} onChange={(e) => setForm({ ...form, school_class_id: e.target.value, teacher_id: '' })}>
              <option value="">Class…</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value, teacher_id: '' })}>
              <option value="">Subject…</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <Select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} disabled={!form.subject_id}>
            <option value="">Teacher…</option>
            {availableTeachers.map((a) => (
              <option key={a.teacher_id} value={a.teacher_id}>
                {a.teacher?.user?.name}
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
          <Select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>
            {DAY_LABELS.map((label, i) => (
              <option key={label} value={i + 1}>
                {label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            <Input placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!form.school_class_id || !form.subject_id || !form.teacher_id || !form.academic_term_id}
              onClick={async () => {
                setError(null)
                try {
                  await createMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
