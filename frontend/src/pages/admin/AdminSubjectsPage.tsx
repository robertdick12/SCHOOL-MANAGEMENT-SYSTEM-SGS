import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subjectsApi } from '@/api/academics'
import { extractErrorMessage } from '@/api/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input } from '@/components/ui/Input'

export function AdminSubjectsPage() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list })

  const createMutation = useMutation({
    mutationFn: () => subjectsApi.create({ name, code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setOpen(false)
      setName('')
      setCode('')
    },
  })

  return (
    <div>
      <PageHeader title="Subjects" action={<Button onClick={() => setOpen(true)}>Add subject</Button>} />

      <DataTable
        isLoading={isLoading}
        rows={data}
        rowKey={(s) => s.id}
        emptyTitle="No subjects yet"
        columns={[
          { header: 'Name', cell: (s) => s.name },
          { header: 'Code', cell: (s) => s.code },
        ]}
      />

      <Modal open={open} title="Add a subject" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <FormField label="Name" htmlFor="subject_name">
            <Input id="subject_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
          </FormField>
          <FormField label="Code" htmlFor="subject_code">
            <Input id="subject_code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. MATH" />
          </FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!name || !code}
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
