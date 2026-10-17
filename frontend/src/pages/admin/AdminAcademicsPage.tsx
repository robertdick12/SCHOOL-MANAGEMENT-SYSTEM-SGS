import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { academicYearsApi, academicTermsApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export function AdminAcademicsPage() {
  const queryClient = useQueryClient()
  const { data: years } = useQuery({ queryKey: ['academic-years'], queryFn: academicYearsApi.list })
  const { data: terms } = useQuery({ queryKey: ['academic-terms'], queryFn: academicTermsApi.list })

  const [yearForm, setYearForm] = useState({ name: '', start_date: '', end_date: '' })
  const [termForm, setTermForm] = useState({ academic_year_id: '', name: '', start_date: '', end_date: '' })
  const [error, setError] = useState<string | null>(null)

  const createYear = useMutation({
    mutationFn: () => academicYearsApi.create(yearForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
      setYearForm({ name: '', start_date: '', end_date: '' })
    },
  })

  const setCurrentYear = useMutation({
    mutationFn: (id: number) => academicYearsApi.update(id, { is_current: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-years'] }),
  })

  const createTerm = useMutation({
    mutationFn: () =>
      academicTermsApi.create({ ...termForm, academic_year_id: Number(termForm.academic_year_id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] })
      setTermForm({ academic_year_id: '', name: '', start_date: '', end_date: '' })
    },
  })

  const setCurrentTerm = useMutation({
    mutationFn: (id: number) => academicTermsApi.update(id, { is_current: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-terms'] }),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Academic years & terms" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Academic years" />
          <CardBody className="space-y-4">
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {years?.map((y) => (
                <li key={y.id} className="flex items-center justify-between py-2">
                  <span>
                    {y.name} <span className="text-slate-400 dark:text-slate-500">({formatDate(y.start_date)} – {formatDate(y.end_date)})</span>
                  </span>
                  {y.is_current ? (
                    <Badge tone="success">Current</Badge>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setCurrentYear.mutate(y.id)}>
                      Set current
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Input placeholder="Name e.g. 2026/2027" value={yearForm.name} onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={yearForm.start_date} onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })} />
                <Input type="date" value={yearForm.end_date} onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })} />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button
                size="sm"
                isLoading={createYear.isPending}
                onClick={async () => {
                  setError(null)
                  try {
                    await createYear.mutateAsync()
                  } catch (e) {
                    setError(extractErrorMessage(e))
                  }
                }}
              >
                Add year
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Academic terms" />
          <CardBody className="space-y-4">
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {terms?.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <span>
                    {t.name} <span className="text-slate-400 dark:text-slate-500">({t.academic_year?.name})</span>
                  </span>
                  {t.is_current ? (
                    <Badge tone="success">Current</Badge>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setCurrentTerm.mutate(t.id)}>
                      Set current
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Select value={termForm.academic_year_id} onChange={(e) => setTermForm({ ...termForm, academic_year_id: e.target.value })}>
                <option value="">Academic year…</option>
                {years?.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </Select>
              <Input placeholder="Name e.g. Term 1" value={termForm.name} onChange={(e) => setTermForm({ ...termForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={termForm.start_date} onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })} />
                <Input type="date" value={termForm.end_date} onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })} />
              </div>
              <Button
                size="sm"
                isLoading={createTerm.isPending}
                onClick={async () => {
                  setError(null)
                  try {
                    await createTerm.mutateAsync()
                  } catch (e) {
                    setError(extractErrorMessage(e))
                  }
                }}
              >
                Add term
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
