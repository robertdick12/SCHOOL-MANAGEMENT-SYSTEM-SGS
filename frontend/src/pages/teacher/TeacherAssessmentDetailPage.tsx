import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentsApi } from '@/api/assessments'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'

export function TeacherAssessmentDetailPage() {
  const { assessmentId } = useParams()
  const id = Number(assessmentId)
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<number, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['assessment-roster', id], queryFn: () => assessmentsApi.roster(id) })

  const submitMutation = useMutation({
    mutationFn: () =>
      assessmentsApi.submitResults(
        id,
        (data?.roster ?? []).map((row) => ({
          student_id: row.student_id,
          score: scores[row.student_id] !== undefined ? Number(scores[row.student_id]) : row.score !== null ? Number(row.score) : null,
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-roster', id] })
      setMessage('Results saved.')
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => assessmentsApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment-roster', id] }),
  })

  if (isLoading || !data) return <PageSpinner />

  const { assessment, roster } = data

  return (
    <div>
      <PageHeader
        title={assessment.name}
        description={`${assessment.subject?.name} — ${assessment.school_class?.name} — out of ${assessment.max_score}`}
        action={
          assessment.is_published ? (
            <Badge tone="success">Published</Badge>
          ) : (
            <Button variant="secondary" isLoading={publishMutation.isPending} onClick={() => publishMutation.mutate()}>
              Publish results
            </Button>
          )
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Student</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {roster.map((row) => (
              <tr key={row.student_id}>
                <td className="px-4 py-2.5 dark:text-slate-100">
                  {row.name} <span className="text-slate-400 dark:text-slate-500">({row.admission_number})</span>
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    max={Number(assessment.max_score)}
                    className="w-24"
                    defaultValue={row.score ?? ''}
                    onChange={(e) => setScores((s) => ({ ...s, [row.student_id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2">
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
          Save scores
        </Button>
      </div>
    </div>
  )
}
