import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { studentsApi, type StudentImportResult } from '@/api/people'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { downloadBlob, formatDate } from '@/lib/utils'

const schema = z.object({
  admission_number: z.string().min(1, 'Required'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  admission_date: z.string().min(1, 'Required'),
})
type FormValues = z.infer<typeof schema>

export function AdminStudentsPage() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<StudentImportResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['students', { search }],
    queryFn: () => studentsApi.list({ search: search || undefined }),
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await studentsApi.exportCsv()
      downloadBlob(blob, 'students.csv')
    } catch (error) {
      setActionError(extractErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }

  const importMutation = useMutation({
    mutationFn: (file: File) => studentsApi.importCsv(file),
    onSuccess: (result) => {
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => setActionError(extractErrorMessage(error)),
  })

  const handleImportFileChosen = (file: File | undefined) => {
    if (!file) return
    setActionError(null)
    importMutation.mutate(file)
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => studentsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setOpen(false)
      reset()
    },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await createMutation.mutateAsync(values)
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="All registered students"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" isLoading={isExporting} onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={importMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              Import CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                handleImportFileChosen(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <Button onClick={() => setOpen(true)}>Register student</Button>
          </div>
        }
      />

      {actionError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {actionError}
        </p>
      )}

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by name or admission number…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        isLoading={isLoading}
        rows={data?.data}
        rowKey={(s) => s.id}
        emptyTitle="No students yet"
        emptyDescription="Register your first student to get started."
        columns={[
          {
            header: 'Name',
            cell: (s) => (
              <Link to={`/admin/students/${s.id}`} className="font-medium text-brand-700 hover:underline">
                {s.first_name} {s.last_name}
              </Link>
            ),
          },
          { header: 'Admission #', cell: (s) => s.admission_number },
          { header: 'Class', cell: (s) => s.enrolments?.[0]?.school_class?.name ?? '—' },
          { header: 'Admitted', cell: (s) => formatDate(s.admission_date) },
          {
            header: 'Status',
            cell: (s) => (
              <Badge tone={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge>
            ),
          },
        ]}
      />

      <Modal open={open} title="Register a student" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="first_name" error={errors.first_name?.message}>
              <Input id="first_name" {...register('first_name')} />
            </FormField>
            <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
              <Input id="last_name" {...register('last_name')} />
            </FormField>
          </div>
          <FormField label="Admission number" htmlFor="admission_number" error={errors.admission_number?.message}>
            <Input id="admission_number" {...register('admission_number')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of birth" htmlFor="date_of_birth" error={errors.date_of_birth?.message}>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </FormField>
            <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
              <Select id="gender" {...register('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Admission date" htmlFor="admission_date" error={errors.admission_date?.message}>
            <Input id="admission_date" type="date" {...register('admission_date')} />
          </FormField>

          {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{serverError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={importResult !== null} title="Import results" onClose={() => setImportResult(null)}>
        {importResult && (
          <div className="space-y-3 text-sm">
            <p className="text-emerald-700 dark:text-emerald-400">
              {importResult.created} student{importResult.created === 1 ? '' : 's'} imported successfully.
            </p>
            {importResult.errors.length > 0 && (
              <div>
                <p className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                  {importResult.errors.length} row{importResult.errors.length === 1 ? '' : 's'} skipped:
                </p>
                <ul className="max-h-60 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  {importResult.errors.map((e) => (
                    <li key={e.row} className="text-red-600 dark:text-red-400">
                      Row {e.row}: {e.messages.join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setImportResult(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
