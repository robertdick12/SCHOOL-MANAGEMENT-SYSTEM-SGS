import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolClassesApi } from '@/api/academics'
import { attendanceApi } from '@/api/assessments'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

const STATUSES = ['present', 'absent', 'late', 'excused'] as const

export function TeacherAttendancePage() {
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [draft, setDraft] = useState<Record<number, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: classes } = useQuery({ queryKey: ['school-classes'], queryFn: schoolClassesApi.list })

  const { data: roster, isLoading } = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: () => attendanceApi.forClassAndDate(Number(classId), date),
    enabled: !!classId && !!date,
  })

  const submitMutation = useMutation({
    mutationFn: () =>
      attendanceApi.submit(
        Number(classId),
        date,
        (roster?.roster ?? []).map((r) => ({
          student_id: r.student_id,
          status: draft[r.student_id] ?? r.status ?? 'present',
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', classId, date] })
      setMessage('Attendance saved.')
      setDraft({})
    },
  })

  return (
    <div>
      <PageHeader title="Attendance" description="Take or review today's register" />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="max-w-xs">
          <option value="">Select a class…</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {!classId ? (
        <EmptyState title="Select a class to take attendance" />
      ) : isLoading ? (
        <PageSpinner />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Student</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {roster?.roster.map((row) => {
                  const current = draft[row.student_id] ?? row.status ?? 'present'
                  return (
                    <tr key={row.student_id}>
                      <td className="px-4 py-2.5 dark:text-slate-100">
                        {row.name} <span className="text-slate-400 dark:text-slate-500">({row.admission_number})</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          {STATUSES.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setDraft((d) => ({ ...d, [row.student_id]: status }))}
                              className={cn(
                                'focus-ring rounded-md px-2.5 py-1 text-xs font-medium capitalize',
                                current === status
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {message && <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button
            isLoading={submitMutation.isPending}
            onClick={async () => {
              setError(null)
              setMessage(null)
              try {
                await submitMutation.mutateAsync()
              } catch (e) {
                setError(extractErrorMessage(e))
              }
            }}
          >
            Save attendance
          </Button>
        </div>
      )}
    </div>
  )
}
